// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useState, memo, useCallback, useRef } from 'react';
import { Stack, Box, Text, Group, ActionIcon, Button } from '@mantine/core';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { IconGripVertical, IconTrash, IconPlus, IconLayoutList } from '@tabler/icons-react';
import { useTranslation } from '../../hooks/useTranslation';
import type { FieldConfig, FieldType } from '../../types/form-builder';

/**
 * Touch-friendly minimum tap target size (44px per Apple guidelines)
 */
const TOUCH_MIN_SIZE = 44;

interface FormCanvasProps {
  fields: FieldConfig[];
  selectedField: FieldConfig | null;
  onFieldSelect: (field: FieldConfig | null) => void;
  onFieldsChange: (fields: FieldConfig[]) => void;
  onFieldDelete?: (id: string) => void;
  isPreview?: boolean;
}

/**
 * SortableFieldItem Component
 * Individual draggable/sortable field in the canvas
 * Touch-friendly with 44px minimum tap targets
 * Memoized for performance
 * Keyboard navigation support
 */
const SortableFieldItem = memo(function SortableFieldItem({
  field,
  isSelected,
  onSelect,
  onDelete,
  onKeyboardNavigate,
}: {
  field: FieldConfig;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onKeyboardNavigate?: (direction: 'up' | 'down') => void;
}): React.ReactElement {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: field.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent): void => {
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        onSelect();
        break;
      case 'Delete':
      case 'Backspace':
        e.preventDefault();
        onDelete();
        break;
      case 'ArrowUp':
        e.preventDefault();
        onKeyboardNavigate?.('up');
        break;
      case 'ArrowDown':
        e.preventDefault();
        onKeyboardNavigate?.('down');
        break;
    }
  };

  return (
    <Box
      ref={setNodeRef}
      style={{
        ...style,
        padding: '14px 16px',
        background: isSelected ? 'var(--emr-selected-bg)' : 'var(--emr-gradient-card)',
        border: `2px solid ${isSelected ? 'var(--emr-secondary)' : 'var(--emr-gray-200)'}`,
        borderRadius: 'var(--emr-border-radius-xl)',
        cursor: 'pointer',
        marginBottom: '10px',
        minHeight: `${TOUCH_MIN_SIZE}px`,
        outline: 'none',
        transition: 'var(--emr-transition-smooth)',
        boxShadow: isSelected ? 'var(--emr-shadow-glow), var(--emr-shadow-soft-md)' : 'var(--emr-shadow-soft)',
        transform: isSelected ? 'scale(1.01)' : 'scale(1)',
      }}
      onClick={onSelect}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="option"
      aria-selected={isSelected}
      aria-label={`${field.label || 'Untitled Field'}, ${field.type}${field.required ? ', required' : ''}`}
      data-testid={`field-item-${field.id}`}
      onMouseEnter={(e) => {
        if (!isSelected && !isDragging) {
          e.currentTarget.style.borderColor = 'var(--emr-accent)';
          e.currentTarget.style.boxShadow = 'var(--emr-shadow-soft-md)';
          e.currentTarget.style.transform = 'scale(1.01)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected && !isDragging) {
          e.currentTarget.style.borderColor = 'var(--emr-gray-200)';
          e.currentTarget.style.boxShadow = 'var(--emr-shadow-soft)';
          e.currentTarget.style.transform = 'scale(1)';
        }
      }}
    >
      <Group justify="space-between" align="center" wrap="nowrap">
        {/* Modern Drag Handle */}
        <Box
          {...attributes}
          {...listeners}
          style={{
            cursor: 'grab',
            color: isSelected ? 'var(--emr-secondary)' : 'var(--emr-gray-400)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: `${TOUCH_MIN_SIZE}px`,
            minHeight: `${TOUCH_MIN_SIZE}px`,
            touchAction: 'none',
            borderRadius: 'var(--emr-border-radius-lg)',
            backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.1)' : 'var(--emr-gray-100)',
            transition: 'var(--emr-transition-smooth)',
          }}
          data-testid={`drag-handle-${field.id}`}
        >
          <IconGripVertical size={18} />
        </Box>

        {/* Field Info */}
        <Box style={{ flex: 1, minWidth: 0, marginLeft: 12 }}>
          <Text size="sm" fw={600} truncate style={{ color: isSelected ? 'var(--emr-primary)' : 'var(--emr-gray-700)' }}>
            {field.label || 'Untitled Field'}
          </Text>
          <Group gap={6} mt={2}>
            <Text size="xs" style={{ color: 'var(--emr-gray-500)' }}>
              {field.type}
            </Text>
            {field.required && (
              <Text size="xs" fw={500} style={{ color: 'var(--emr-secondary)' }}>
                Required
              </Text>
            )}
          </Group>
        </Box>

        {/* Modern Delete Button */}
        <ActionIcon
          variant="subtle"
          size={40}
          radius="lg"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          aria-label={`Delete ${field.label || 'field'}`}
          data-testid={`delete-button-${field.id}`}
          style={{
            backgroundColor: 'var(--emr-gray-100)',
            color: 'var(--emr-gray-400)',
            transition: 'var(--emr-transition-smooth)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
            e.currentTarget.style.color = '#ef4444';
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--emr-gray-100)';
            e.currentTarget.style.color = 'var(--emr-gray-400)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <IconTrash size={16} />
        </ActionIcon>
      </Group>
    </Box>
  );
});

/**
 * FormCanvas Component
 *
 * Center panel for building the form
 * - Drop zone for fields
 * - Sortable field list
 * - Click to select fields
 * - Drag handles for reordering
 * - Keyboard navigation (Arrow keys, Delete, Enter)
 * - Memoized for performance
 */
export const FormCanvas = memo(function FormCanvas({
  fields,
  selectedField,
  onFieldSelect,
  onFieldsChange,
  onFieldDelete,
  isPreview = false,
}: FormCanvasProps): React.ReactElement {
  const { t } = useTranslation();
  const [isDragOver, setIsDragOver] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState<string>('');
  const fieldRefs = useRef<Map<string, HTMLElement>>(new Map());

  const { setNodeRef, isOver } = useDroppable({
    id: 'form-canvas',
  });

  // Configure sensors for pointer and touch support
  // Touch support is essential for tablet devices
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px drag distance before activating (prevents accidental drags)
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200, // 200ms delay for touch to distinguish from scroll
        tolerance: 5, // 5px tolerance before canceling
      },
    })
  );

  // Get the currently dragged field for DragOverlay
  const activeField = activeId ? fields.find((f) => f.id === activeId) : null;

  const handleDragStart = (event: DragStartEvent): void => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent): void => {
    const { active, over } = event;

    setActiveId(null); // Clear active drag

    if (!over) {
      // Dropped outside - check if it's a new field from palette
      const fieldType = active.data.current?.type as FieldType | undefined;
      if (fieldType) {
        // Add new field
        const newField: FieldConfig = {
          id: `field-${Date.now()}`,
          linkId: `field-${Date.now()}`,
          type: fieldType,
          label: t(`fieldTypes.${fieldType}`),
          required: false,
          order: fields.length,
        };
        onFieldsChange([...fields, newField]);
        onFieldSelect(newField);
      }
      setIsDragOver(false);
      return;
    }

    // Reordering existing fields
    if (active.id !== over.id) {
      const oldIndex = fields.findIndex((f) => f.id === active.id);
      const newIndex = fields.findIndex((f) => f.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newFields = arrayMove(fields, oldIndex, newIndex).map((f, idx) => ({
          ...f,
          order: idx,
        }));
        onFieldsChange(newFields);
      }
    }

    setIsDragOver(false);
  };

  const handleDragOver = (event: DragOverEvent): void => {
    const { over } = event;
    setIsDragOver(!!over);
  };

  const handleFieldDelete = useCallback((fieldId: string): void => {
    const deletedField = fields.find((f) => f.id === fieldId);

    // Use onFieldDelete prop if provided (for integrated state), otherwise update fields directly
    if (onFieldDelete) {
      onFieldDelete(fieldId);
    } else {
      const newFields = fields.filter((f) => f.id !== fieldId);
      onFieldsChange(newFields);
      if (selectedField?.id === fieldId) {
        onFieldSelect(null);
      }
    }

    // Announce deletion for screen readers
    if (deletedField) {
      setAnnouncement(`${deletedField.label || 'Field'} deleted`);
    }
  }, [fields, selectedField, onFieldsChange, onFieldSelect, onFieldDelete]);

  const handleAddField = useCallback((): void => {
    // Add a default text field
    const newField: FieldConfig = {
      id: `field-${Date.now()}`,
      linkId: `field-${Date.now()}`,
      type: 'text',
      label: 'New Field',
      required: false,
      order: fields.length,
    };
    onFieldsChange([...fields, newField]);
    onFieldSelect(newField);
    // Announce addition for screen readers
    setAnnouncement('New field added');
  }, [fields, onFieldsChange, onFieldSelect]);

  // Handle keyboard navigation between fields
  const handleKeyboardNavigate = useCallback((fieldIndex: number, direction: 'up' | 'down'): void => {
    const newIndex = direction === 'up' ? fieldIndex - 1 : fieldIndex + 1;
    if (newIndex >= 0 && newIndex < fields.length) {
      onFieldSelect(fields[newIndex]);
      // Focus the new field element
      const fieldElement = fieldRefs.current.get(fields[newIndex].id);
      if (fieldElement) {
        fieldElement.focus();
      }
    }
  }, [fields, onFieldSelect]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
    >
      {/* ARIA live region for announcements */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: 0,
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: 0,
        }}
      >
        {announcement}
      </div>

      <Box
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--emr-glass-bg)',
          backdropFilter: 'var(--emr-backdrop-blur)',
          borderLeft: '1px solid rgba(0, 0, 0, 0.06)',
          borderRight: '1px solid rgba(0, 0, 0, 0.06)',
        }}
        data-testid="form-canvas"
        role="region"
        aria-label={t('formUI.builder.canvas') || 'Form Canvas'}
      >
        {/* Subtle Panel Header - matching FieldPalette style */}
        <Box
          style={{
            padding: '12px 20px',
            background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
            borderBottom: '1px solid var(--emr-gray-200)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Group gap="xs" align="center">
            <IconLayoutList size={16} style={{ color: 'var(--emr-gray-400)' }} />
            <Text size="xs" fw={600} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.05em' }}>
              {t('formUI.builder.canvas')}
            </Text>
          </Group>
          {!isPreview && (
            <Button
              size="xs"
              radius="xl"
              variant="light"
              leftSection={<IconPlus size={14} />}
              onClick={handleAddField}
              style={{
                minHeight: '32px',
                fontWeight: 500,
              }}
              data-testid="add-field-button"
            >
              {t('formUI.buttons.addField')}
            </Button>
          )}
        </Box>

        {/* Modern Drop Zone */}
        <Box
          ref={setNodeRef}
          style={{
            flex: 1,
            padding: '20px',
            background: isDragOver || isOver
              ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(99, 179, 237, 0.08) 100%)'
              : 'var(--emr-gradient-canvas)',
            border: `2px dashed ${isDragOver || isOver ? 'var(--emr-secondary)' : 'var(--emr-gray-300)'}`,
            borderRadius: 'var(--emr-border-radius-xl)',
            margin: '16px',
            minHeight: '400px',
            transition: 'var(--emr-transition-smooth)',
            position: 'relative',
          }}
        >
          {fields.length === 0 ? (
            <Stack align="center" justify="center" style={{ height: '100%', minHeight: '350px' }}>
              {/* Modern empty state */}
              <Box
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(99, 179, 237, 0.15) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16,
                  boxShadow: 'var(--emr-shadow-soft-md)',
                }}
              >
                <IconPlus size={36} style={{ color: 'var(--emr-secondary)' }} />
              </Box>
              <Text size="lg" fw={600} style={{ color: 'var(--emr-gray-700)' }} ta="center">
                Build your form
              </Text>
              <Text size="sm" style={{ color: 'var(--emr-gray-500)', maxWidth: 280 }} ta="center">
                Drag fields from the palette or click the + button to start adding form elements
              </Text>
            </Stack>
          ) : (
            <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
              <Stack gap={0} role="listbox" aria-label="Form fields">
                {fields.map((field, index) => (
                  <SortableFieldItem
                    key={field.id}
                    field={field}
                    isSelected={selectedField?.id === field.id}
                    onSelect={() => onFieldSelect(field)}
                    onDelete={() => handleFieldDelete(field.id)}
                    onKeyboardNavigate={(direction) => handleKeyboardNavigate(index, direction)}
                  />
                ))}
              </Stack>
            </SortableContext>
          )}
        </Box>
      </Box>

      {/* Modern DragOverlay */}
      <DragOverlay>
        {activeField ? (
          <Box
            style={{
              padding: '14px 16px',
              background: 'white',
              border: '2px solid var(--emr-secondary)',
              borderRadius: 'var(--emr-border-radius-xl)',
              boxShadow: '0 8px 32px rgba(59, 130, 246, 0.25), 0 4px 12px rgba(0, 0, 0, 0.1)',
              cursor: 'grabbing',
            }}
          >
            <Group justify="space-between" align="center" wrap="nowrap">
              <Box
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 40,
                  height: 40,
                  borderRadius: 'var(--emr-border-radius-lg)',
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  color: 'var(--emr-secondary)',
                }}
              >
                <IconGripVertical size={18} />
              </Box>
              <Box style={{ flex: 1, minWidth: 0, marginLeft: 12 }}>
                <Text size="sm" fw={600} truncate style={{ color: 'var(--emr-primary)' }}>
                  {activeField.label || 'Untitled Field'}
                </Text>
                <Group gap={6} mt={2}>
                  <Text size="xs" style={{ color: 'var(--emr-gray-500)' }}>
                    {activeField.type}
                  </Text>
                  {activeField.required && (
                    <Text size="xs" fw={500} style={{ color: 'var(--emr-secondary)' }}>
                      Required
                    </Text>
                  )}
                </Group>
              </Box>
            </Group>
          </Box>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
});
