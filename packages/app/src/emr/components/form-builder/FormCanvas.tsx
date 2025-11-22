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
import { IconGripVertical, IconTrash, IconPlus } from '@tabler/icons-react';
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
    opacity: isDragging ? 0.5 : 1,
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
        padding: 'var(--mantine-spacing-md)',
        backgroundColor: isSelected ? 'var(--emr-section-active-bg)' : 'white',
        border: `2px solid ${isSelected ? 'var(--emr-secondary)' : 'var(--emr-gray-200)'}`,
        borderRadius: 'var(--mantine-radius-md)',
        cursor: 'pointer',
        marginBottom: 'var(--mantine-spacing-sm)',
        minHeight: `${TOUCH_MIN_SIZE}px`, // Touch-friendly minimum height
        outline: 'none',
      }}
      onClick={onSelect}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="option"
      aria-selected={isSelected}
      aria-label={`${field.label || 'Untitled Field'}, ${field.type}${field.required ? ', required' : ''}`}
      data-testid={`field-item-${field.id}`}
    >
      <Group justify="space-between" align="center" wrap="nowrap">
        {/* Drag Handle - Touch-friendly size */}
        <Box
          {...attributes}
          {...listeners}
          style={{
            cursor: 'grab',
            color: 'var(--emr-gray-400)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: `${TOUCH_MIN_SIZE}px`,
            minHeight: `${TOUCH_MIN_SIZE}px`,
            touchAction: 'none', // Prevent scroll interference on touch
          }}
          data-testid={`drag-handle-${field.id}`}
        >
          <IconGripVertical size={20} />
        </Box>

        {/* Field Info */}
        <Box style={{ flex: 1, minWidth: 0 }}>
          <Text size="sm" fw={500} truncate>
            {field.label || 'Untitled Field'}
          </Text>
          <Text size="xs" c="dimmed" truncate>
            {field.type}
            {field.required && ' • Required'}
          </Text>
        </Box>

        {/* Delete Button - Touch-friendly size */}
        <ActionIcon
          variant="subtle"
          color="red"
          size={TOUCH_MIN_SIZE}
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          aria-label={`Delete ${field.label || 'field'}`}
          data-testid={`delete-button-${field.id}`}
        >
          <IconTrash size={20} />
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
        style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
        data-testid="form-canvas"
        role="region"
        aria-label={t('formUI.builder.canvas') || 'Form Canvas'}
      >
        {/* Header */}
        <Group justify="space-between" align="center" mb="md">
          <Text size="lg" fw={600}>
            {t('formUI.builder.canvas')}
          </Text>
          {!isPreview && (
            <Button
              variant="light"
              size="md"
              leftSection={<IconPlus size={18} />}
              onClick={handleAddField}
              style={{ minHeight: `${TOUCH_MIN_SIZE}px` }}
              data-testid="add-field-button"
            >
              {t('formUI.buttons.addField')}
            </Button>
          )}
        </Group>

        {/* Drop Zone */}
        <Box
          ref={setNodeRef}
          style={{
            flex: 1,
            padding: 'var(--mantine-spacing-md)',
            backgroundColor: isDragOver || isOver ? 'var(--emr-section-hover-bg)' : 'transparent',
            border: `2px dashed ${isDragOver || isOver ? 'var(--emr-secondary)' : 'var(--emr-gray-300)'}`,
            borderRadius: 'var(--mantine-radius-md)',
            minHeight: '400px',
            transition: 'all 0.2s ease',
          }}
        >
          {fields.length === 0 ? (
            <Stack align="center" justify="center" style={{ height: '100%', minHeight: '300px' }}>
              <Text size="lg" c="dimmed" ta="center">
                Drag fields here or click +
              </Text>
              <Text size="sm" c="dimmed" ta="center">
                Start building your form by adding fields from the palette
              </Text>
            </Stack>
          ) : (
            <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
              <Stack gap="xs" role="listbox" aria-label="Form fields">
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

      {/* DragOverlay for smooth drag animation */}
      <DragOverlay>
        {activeField ? (
          <Box
            style={{
              padding: 'var(--mantine-spacing-md)',
              backgroundColor: 'white',
              border: '2px solid var(--emr-secondary)',
              borderRadius: 'var(--mantine-radius-md)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              cursor: 'grabbing',
              opacity: 0.9,
            }}
          >
            <Group justify="space-between" align="center" wrap="nowrap">
              <Box style={{ display: 'flex', alignItems: 'center', color: 'var(--emr-gray-400)' }}>
                <IconGripVertical size={18} />
              </Box>
              <Box style={{ flex: 1, minWidth: 0 }}>
                <Text size="sm" fw={500} truncate>
                  {activeField.label || 'Untitled Field'}
                </Text>
                <Text size="xs" c="dimmed" truncate>
                  {activeField.type}
                  {activeField.required && ' • Required'}
                </Text>
              </Box>
            </Group>
          </Box>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
});
