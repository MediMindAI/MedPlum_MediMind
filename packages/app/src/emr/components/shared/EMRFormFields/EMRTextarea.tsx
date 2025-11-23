/**
 * EMRTextarea - Standardized textarea component
 * Consistent styling across all textareas in the EMR system
 */

import React, { useId, forwardRef, useCallback } from 'react';
import { Textarea } from '@mantine/core';
import { EMRTextareaProps } from './EMRFieldTypes';
import { EMRFieldWrapper } from './EMRFieldWrapper';
import './emr-fields.css';

/**
 * EMRTextarea component
 * A production-ready textarea with consistent styling
 */
export const EMRTextarea = forwardRef<HTMLTextAreaElement, EMRTextareaProps>(
  (
    {
      // Field wrapper props
      id,
      name,
      label,
      placeholder,
      helpText,
      error,
      successMessage,
      warningMessage,
      size = 'md',
      required,
      disabled,
      readOnly,
      validationState,
      className = '',
      style,
      'data-testid': dataTestId,
      'aria-label': ariaLabel,
      'aria-describedby': ariaDescribedBy,
      fullWidth = true,

      // Textarea specific props
      value,
      defaultValue,
      onChange,
      onChangeEvent,
      onBlur,
      onFocus,
      rows = 4,
      minRows,
      maxRows,
      autosize = false,
      maxLength,
      showCount = false,
      resize = 'vertical',
    },
    ref
  ): React.JSX.Element => {
    const generatedId = useId();
    const inputId = id || generatedId;

    // Handle change event
    const handleChange = useCallback(
      (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (onChangeEvent) {
          onChangeEvent(event);
        }
        if (onChange) {
          onChange(event.target.value);
        }
      },
      [onChange, onChangeEvent]
    );

    // Determine validation state
    const getValidationState = () => {
      if (validationState) return validationState;
      if (error) return 'error';
      if (successMessage) return 'success';
      if (warningMessage) return 'warning';
      return 'default';
    };

    const state = getValidationState();

    // Build input classes
    const inputClasses = [
      'emr-input',
      'emr-textarea',
      `size-${size}`,
      state === 'error' && 'has-error',
      state === 'success' && 'has-success',
      state === 'warning' && 'has-warning',
      resize === 'none' && 'no-resize',
    ]
      .filter(Boolean)
      .join(' ');

    // Character count
    const currentLength = value?.length || 0;
    const isAtLimit = maxLength && currentLength === maxLength;
    const isOverLimit = maxLength && currentLength > maxLength;

    // Count class
    const countClass = [
      'emr-textarea-counter',
      isAtLimit && 'at-limit',
      isOverLimit && 'over-limit',
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <EMRFieldWrapper
        label={label}
        required={required}
        helpText={helpText}
        error={error}
        successMessage={successMessage}
        warningMessage={warningMessage}
        validationState={validationState}
        size={size}
        fullWidth={fullWidth}
        className={className}
        style={style}
        htmlFor={inputId}
      >
        <Textarea
          ref={ref}
          id={inputId}
          name={name}
          value={value}
          defaultValue={defaultValue}
          onChange={handleChange}
          onBlur={onBlur}
          onFocus={onFocus}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          rows={rows}
          minRows={autosize ? minRows : undefined}
          maxRows={autosize ? maxRows : undefined}
          autosize={autosize}
          maxLength={maxLength}
          required={required}
          aria-label={ariaLabel}
          aria-describedby={ariaDescribedBy}
          aria-invalid={state === 'error'}
          data-testid={dataTestId}
          error={!!error}
          classNames={{
            input: inputClasses,
          }}
          styles={{
            input: {
              fontSize: 'var(--emr-input-font-size)',
              borderColor: state === 'error'
                ? 'var(--emr-input-error-border)'
                : state === 'success'
                ? 'var(--emr-input-success-border)'
                : state === 'warning'
                ? 'var(--emr-input-warning-border)'
                : 'var(--emr-input-border)',
              borderRadius: 'var(--emr-input-border-radius)',
              backgroundColor: state === 'error'
                ? 'var(--emr-input-error-bg)'
                : state === 'success'
                ? 'var(--emr-input-success-bg)'
                : state === 'warning'
                ? 'var(--emr-input-warning-bg)'
                : 'var(--emr-input-bg)',
              transition: 'var(--emr-input-transition)',
              resize: resize,
              '&:focus': {
                borderColor: state === 'error'
                  ? 'var(--emr-input-error-border)'
                  : 'var(--emr-input-border-focus)',
                boxShadow: state === 'error'
                  ? 'var(--emr-input-error-glow)'
                  : state === 'success'
                  ? 'var(--emr-input-success-glow)'
                  : state === 'warning'
                  ? 'var(--emr-input-warning-glow)'
                  : 'var(--emr-input-focus-ring)',
              },
              '&:hover:not(:disabled):not(:focus)': {
                borderColor: state === 'error'
                  ? 'var(--emr-input-error-border)'
                  : 'var(--emr-input-border-hover)',
              },
              '&:disabled': {
                backgroundColor: 'var(--emr-input-bg-disabled)',
                color: 'var(--emr-input-text-disabled)',
              },
            },
            wrapper: {
              width: fullWidth ? '100%' : undefined,
            },
          }}
        />
        {showCount && maxLength && (
          <div className={countClass}>
            {currentLength}/{maxLength}
          </div>
        )}
      </EMRFieldWrapper>
    );
  }
);

EMRTextarea.displayName = 'EMRTextarea';

export default EMRTextarea;
