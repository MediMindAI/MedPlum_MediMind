/**
 * EMRFormActions - Submit and cancel button bar for forms
 * Consistent styling and placement across all forms
 */

import React from 'react';
import { Button, Group } from '@mantine/core';
import { IconCheck, IconX } from '@tabler/icons-react';
import { EMRFormActionsProps } from './EMRFieldTypes';
import './emr-fields.css';

/**
 * EMRFormActions component
 * Provides consistent submit/cancel button layout
 */
export function EMRFormActions({
  submitLabel = 'Save',
  cancelLabel = 'Cancel',
  onSubmit,
  onCancel,
  loading = false,
  disabled = false,
  align = 'right',
  showCancel = true,
  additionalActions,
  className = '',
  style,
}: EMRFormActionsProps): React.JSX.Element {
  // Build container classes
  const containerClasses = [
    'emr-form-actions',
    `align-${align}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={containerClasses} style={style}>
      {/* Cancel button on left when space-between */}
      {align === 'space-between' && showCancel && onCancel && (
        <Button
          variant="outline"
          color="gray"
          onClick={onCancel}
          disabled={loading}
          leftSection={<IconX size={16} />}
          styles={{
            root: {
              borderColor: 'var(--emr-input-border)',
              color: 'var(--emr-input-text)',
              fontSize: 'var(--emr-input-font-size)',
              height: 'var(--emr-input-height-md)',
              borderRadius: 'var(--emr-input-border-radius)',
              transition: 'var(--emr-input-transition)',
              '&:hover': {
                backgroundColor: 'var(--emr-hover-bg)',
                borderColor: 'var(--emr-input-border-hover)',
              },
            },
          }}
        >
          {cancelLabel}
        </Button>
      )}

      {/* Additional actions in the middle */}
      {additionalActions}

      {/* Primary actions group */}
      <Group gap="sm" className="emr-form-actions-primary">
        {/* Cancel button (when not space-between) */}
        {align !== 'space-between' && showCancel && onCancel && (
          <Button
            variant="outline"
            color="gray"
            onClick={onCancel}
            disabled={loading}
            leftSection={<IconX size={16} />}
            styles={{
              root: {
                borderColor: 'var(--emr-input-border)',
                color: 'var(--emr-input-text)',
                fontSize: 'var(--emr-input-font-size)',
                height: 'var(--emr-input-height-md)',
                borderRadius: 'var(--emr-input-border-radius)',
                transition: 'var(--emr-input-transition)',
                '&:hover': {
                  backgroundColor: 'var(--emr-hover-bg)',
                  borderColor: 'var(--emr-input-border-hover)',
                },
              },
            }}
          >
            {cancelLabel}
          </Button>
        )}

        {/* Submit button */}
        {onSubmit && (
          <Button
            onClick={onSubmit}
            loading={loading}
            disabled={disabled || loading}
            leftSection={!loading ? <IconCheck size={16} /> : undefined}
            styles={{
              root: {
                background: 'var(--emr-gradient-primary)',
                fontSize: 'var(--emr-input-font-size)',
                height: 'var(--emr-input-height-md)',
                borderRadius: 'var(--emr-input-border-radius)',
                transition: 'var(--emr-input-transition)',
                border: 'none',
                '&:hover': {
                  background: 'var(--emr-gradient-secondary)',
                  transform: 'translateY(-1px)',
                  boxShadow: 'var(--emr-shadow-md)',
                },
                '&:active': {
                  transform: 'translateY(0)',
                },
                '&:disabled': {
                  opacity: 0.6,
                  cursor: 'not-allowed',
                },
              },
            }}
          >
            {submitLabel}
          </Button>
        )}
      </Group>
    </div>
  );
}

export default EMRFormActions;
