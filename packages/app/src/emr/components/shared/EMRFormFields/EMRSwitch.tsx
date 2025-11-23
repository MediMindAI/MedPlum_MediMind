/**
 * EMRSwitch - Standardized toggle switch component
 * Consistent styling across all switches in the EMR system
 */

import React, { useId, forwardRef, useCallback } from 'react';
import { Switch } from '@mantine/core';
import { EMRSwitchProps } from './EMRFieldTypes';
import './emr-fields.css';

/**
 * EMRSwitch component
 * A production-ready toggle switch with consistent styling
 */
export const EMRSwitch = forwardRef<HTMLInputElement, EMRSwitchProps>(
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

      // Switch specific props
      checked,
      defaultChecked,
      onChange,
      onChangeEvent,
      labelPosition = 'right',
      color,
      onLabel,
      offLabel,
      thumbIcon,
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
      'emr-checkbox-wrapper', // Reuse checkbox wrapper styles
      disabled && 'disabled',
      labelPosition === 'left' && 'label-left',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className={wrapperClasses} style={style}>
        <Switch
          ref={ref}
          id={inputId}
          name={name}
          checked={checked}
          defaultChecked={defaultChecked}
          onChange={handleChange}
          label={label}
          description={helpText}
          disabled={disabled || readOnly}
          labelPosition={labelPosition}
          required={required}
          aria-label={ariaLabel}
          aria-describedby={ariaDescribedBy}
          aria-invalid={hasError}
          data-testid={dataTestId}
          error={typeof error === 'string' ? error : hasError}
          color={color || 'blue'}
          size={size}
          onLabel={onLabel}
          offLabel={offLabel}
          thumbIcon={thumbIcon}
          styles={{
            root: {
              width: '100%',
            },
            track: {
              cursor: disabled ? 'not-allowed' : 'pointer',
              borderColor: hasError ? 'var(--emr-input-error-border)' : 'transparent',
              transition: 'var(--emr-input-transition)',
              backgroundColor: checked
                ? (color || 'var(--emr-secondary)')
                : 'var(--emr-gray-300)',
              // Note: Focus styles are handled via CSS classes in emr-fields.css
            },
            thumb: {
              backgroundColor: 'white',
              border: 'none',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)',
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

EMRSwitch.displayName = 'EMRSwitch';

export default EMRSwitch;
