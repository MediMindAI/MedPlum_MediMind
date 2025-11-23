// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useState, useCallback } from 'react';
import { Box } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { DndContext, DragEndEvent, DragStartEvent, closestCenter, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { FieldPalette } from './FieldPalette';
import { FormCanvas } from './FormCanvas';
import { PropertiesPanel } from './PropertiesPanel';
import { FormPreview } from './FormPreview';
import { useTranslation } from '../../hooks/useTranslation';
import type { FieldConfig, FieldType } from '../../types/form-builder';

/**
 * Props for FormBuilderLayout - accepts state from parent
 */
export interface FormBuilderLayoutProps {
  /** Form fields array */
  fields: FieldConfig[];
  /** Form title */
  formTitle: string;
  /** Currently selected field ID */
  selectedFieldId: string | null;
  /** Callback when fields change */
  onFieldsChange: (fields: FieldConfig[]) => void;
  /** Callback when a field is selected */
  onFieldSelect: (id: string | null) => void;
  /** Callback when a field is added */
  onFieldAdd: (field: FieldConfig) => void;
  /** Callback when a field is updated */
  onFieldUpdate: (field: FieldConfig) => void;
  /** Callback when a field is deleted */
  onFieldDelete: (id: string) => void;
  /** Callback to reorder fields */
  onFieldsReorder: (fromIndex: number, toIndex: number) => void;
}

/**
 * FormBuilderLayout Component
 *
 * Three-panel layout for the form builder:
 * - Left (20%): FieldPalette - draggable field types
 * - Center (55%): FormCanvas - drop zone for building form
 * - Right (25%): PropertiesPanel - field configuration
 *
 * Features:
 * - Real-time preview updates when fields change
 * - Touch-friendly with 44px minimum tap targets
 * - Mobile-responsive: panels collapse on small screens
 * - Unified DndContext for drag-and-drop between palette and canvas
 */
export function FormBuilderLayout({
  fields,
  formTitle,
  selectedFieldId,
  onFieldsChange,
  onFieldSelect,
  onFieldAdd,
  onFieldUpdate,
  onFieldDelete,
  onFieldsReorder,
}: FormBuilderLayoutProps): React.ReactElement {
  const { t } = useTranslation();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [isPreview, setIsPreview] = useState<boolean>(false);

  // Find the selected field from the fields array
  const selectedField = selectedFieldId ? fields.find(f => f.id === selectedFieldId) || null : null;

  // Configure sensors for pointer and touch support
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    })
  );

  const handleTogglePreview = (): void => {
    setIsPreview(!isPreview);
  };

  const handleFieldSelectCallback = useCallback((field: FieldConfig | null): void => {
    onFieldSelect(field?.id || null);
  }, [onFieldSelect]);

  const handleFieldsChangeCallback = useCallback((newFields: FieldConfig[]): void => {
    onFieldsChange(newFields);
  }, [onFieldsChange]);

  /**
   * Handle field updates from PropertiesPanel
   * Updates the field in the fields array for real-time preview
   */
  const handleFieldUpdateCallback = useCallback((updatedField: FieldConfig | null): void => {
    if (!updatedField) {
      onFieldSelect(null);
      return;
    }
    onFieldUpdate(updatedField);
  }, [onFieldSelect, onFieldUpdate]);

  /**
   * Handle drag start - track active item for overlay
   */
  const handleDragStart = (_event: DragStartEvent): void => {
    // Drag start - could be used for visual feedback
  };

  /**
   * Handle drag end - add new field or reorder existing
   */
  const handleDragEnd = (event: DragEndEvent): void => {
    const { active, over } = event;

    // Check if dragging from palette (new field)
    const isFromPalette = (active.id as string).startsWith('field-type-');

    if (isFromPalette) {
      // Extract field type from palette item ID
      const fieldType = (active.id as string).replace('field-type-', '') as FieldType;

      // Create new field
      const newField: FieldConfig = {
        id: `field-${Date.now()}`,
        linkId: `field-${Date.now()}`,
        type: fieldType,
        label: t(`fieldTypes.${fieldType}`) || 'New Field',
        required: false,
        order: fields.length,
      };

      onFieldAdd(newField);
      onFieldSelect(newField.id);
      return;
    }

    // Reordering existing fields
    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((f) => f.id === active.id);
      const newIndex = fields.findIndex((f) => f.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        onFieldsReorder(oldIndex, newIndex);
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <Box style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Three-panel layout using flexbox for proper scrolling */}
        <Box style={{ flex: 1, overflow: 'hidden', display: 'flex', minHeight: 0, background: 'var(--emr-gray-50)' }}>
          {/* Left Panel: Field Palette (fixed 280px - enhanced width for better UX) */}
          {!isMobile && !isPreview && (
            <Box
              style={{
                width: 'var(--emr-panel-width-palette)',
                flexShrink: 0,
                borderRight: '1px solid var(--emr-gray-200)',
                background: 'white',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                boxShadow: 'var(--emr-shadow-panel)',
              }}
            >
              <FieldPalette />
            </Box>
          )}

          {/* Center Panel: Form Canvas (flexible) */}
          <Box
            style={{
              flex: 1,
              minWidth: 0,
              overflowY: 'auto',
              padding: '20px',
              background: 'var(--emr-gradient-canvas)',
            }}
          >
            <FormCanvas
              fields={fields}
              selectedField={selectedField}
              onFieldSelect={handleFieldSelectCallback}
              onFieldsChange={handleFieldsChangeCallback}
              isPreview={isPreview}
              onFieldDelete={onFieldDelete}
            />
          </Box>

          {/* Preview Panel (50% when preview is active) */}
          {isPreview && (
            <Box
              style={{
                width: '50%',
                borderLeft: '1px solid var(--emr-gray-200)',
                backgroundColor: 'white',
                overflowY: 'auto',
              }}
            >
              <FormPreview fields={fields} title={formTitle} />
            </Box>
          )}

          {/* Right Panel: Properties Panel (fixed 320px - enhanced width for better UX) */}
          {!isMobile && !isPreview && selectedField && (
            <Box
              style={{
                width: '340px',
                flexShrink: 0,
                borderLeft: '1px solid var(--emr-gray-200)',
                background: 'white',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                boxShadow: '-2px 0 12px rgba(0, 0, 0, 0.04)',
              }}
            >
              <PropertiesPanel
                selectedField={selectedField}
                onFieldUpdate={handleFieldUpdateCallback}
              />
            </Box>
          )}
        </Box>
      </Box>
    </DndContext>
  );
}
