/**
 * EMRCheckbox - Standardized checkbox component
 * Consistent styling across all checkboxes in the EMR system
 */

import React, { useId, forwardRef, useCallback } from 'react';
import { Checkbox } from '@mantine/core';
import { EMRCheckboxProps } from './EMRFieldTypes';
import './emr-fields.css';

/**
 * EMRCheckbox component
 * A production-ready checkbox with consistent styling
 */
export const EMRCheckbox = forwardRef<HTMLInputElement, EMRCheckboxProps>(
  (
    {
      // Field props
      id,
      name,
      label,
      helpText,
      error,
      size = 'md',
      required,
      disabled,
      readOnly,
      className = '',
      style,
      'data-testid': dataTestId,
      'aria-label': ariaLabel,
      'aria-describedby': ariaDescribedBy,

      // Checkbox specific props
      checked,
      defaultChecked,
      onChange,
      onChangeEvent,
      indeterminate,
      labelPosition = 'right',
      color,
    },
    ref
  ): React.JSX.Element => {
    const generatedId = useId();
    const inputId = id || generatedId;

    // Handle change event
    const handleChange = useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        if (onChangeEvent) {
          onChangeEvent(event);
        }
        if (onChange) {
          onChange(event.target.checked);
        }
      },
      [onChange, onChangeEvent]
    );

    // Determine error state
    const hasError = !!error;

    // Wrapper classes
    const wrapperClasses = [
      'emr-checkbox-wrapper',
      disabled && 'disabled',
      labelPosition === 'left' && 'label-left',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className={wrapperClasses} style={style}>
        <Checkbox
          ref={ref}
          id={inputId}
          name={name}
          checked={checked}
          defaultChecked={defaultChecked}
          onChange={handleChange}
          label={label}
          description={helpText}
          disabled={disabled || readOnly}
          indeterminate={indeterminate}
          labelPosition={labelPosition}
          required={required}
          aria-label={ariaLabel}
          aria-describedby={ariaDescribedBy}
          aria-invalid={hasError}
          data-testid={dataTestId}
          error={typeof error === 'string' ? error : hasError}
          color={color || 'blue'}
          size={size}
          styles={{
            root: {
              width: '100%',
            },
            input: {
              cursor: disabled ? 'not-allowed' : 'pointer',
              borderColor: hasError ? 'var(--emr-input-error-border)' : 'var(--emr-input-border)',
              borderRadius: '4px',
              transition: 'var(--emr-input-transition)',
              '&:checked': {
                backgroundColor: color || 'var(--emr-secondary)',
                borderColor: color || 'var(--emr-secondary)',
              },
              '&:focus': {
                boxShadow: hasError
                  ? 'var(--emr-input-error-glow)'
                  : 'var(--emr-input-focus-ring)',
              },
            },
            label: {
              fontSize: 'var(--emr-input-font-size)',
              color: 'var(--emr-input-text)',
              fontWeight: 'normal',
              cursor: disabled ? 'not-allowed' : 'pointer',
            },
            description: {
              fontSize: 'var(--emr-input-help-size)',
              color: 'var(--emr-input-help-color)',
            },
            error: {
              fontSize: 'var(--emr-input-help-size)',
              color: 'var(--emr-input-error-text)',
            },
          }}
        />
      </div>
    );
  }
);

EMRCheckbox.displayName = 'EMRCheckbox';

export default EMRCheckbox;
