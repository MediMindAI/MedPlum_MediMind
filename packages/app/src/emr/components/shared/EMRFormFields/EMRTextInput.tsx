/**
 * EMRTextInput - Standardized text input component
 * Consistent styling across all text inputs in the EMR system
 */

import React, { useId, forwardRef, useCallback } from 'react';
import { TextInput } from '@mantine/core';
import { IconX } from '@tabler/icons-react';
import { EMRTextInputProps } from './EMRFieldTypes';
import { EMRFieldWrapper } from './EMRFieldWrapper';
import './emr-fields.css';

/**
 * EMRTextInput component
 * A production-ready text input with consistent styling
 */
export const EMRTextInput = forwardRef<HTMLInputElement, EMRTextInputProps>(
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
      leftSection,
      rightSection,
      className = '',
      style,
      'data-testid': dataTestId,
      'aria-label': ariaLabel,
      'aria-describedby': ariaDescribedBy,
      clearable,
      onClear,
      fullWidth = true,

      // Input specific props
      type = 'text',
      value,
      defaultValue,
      onChange,
      onChangeEvent,
      onBlur,
      onFocus,
      onKeyDown,
      maxLength,
      pattern,
      autoComplete,
      autoFocus,
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
          onChange(event.target.value);
        }
      },
      [onChange, onChangeEvent]
    );

    // Handle clear
    const handleClear = useCallback(() => {
      if (onClear) {
        onClear();
      } else if (onChange) {
        onChange('');
      }
    }, [onClear, onChange]);

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
      `size-${size}`,
      state === 'error' && 'has-error',
      state === 'success' && 'has-success',
      state === 'warning' && 'has-warning',
      leftSection && 'has-left-section',
      (rightSection || (clearable && value)) && 'has-right-section',
    ]
      .filter(Boolean)
      .join(' ');

    // Calculate heights based on size
    const heights = {
      sm: 36,
      md: 42,
      lg: 48,
    };

    // Right section with clear button
    const rightSectionContent = clearable && value ? (
      <button
        type="button"
        className="emr-input-clear-btn"
        onClick={handleClear}
        tabIndex={-1}
        aria-label="Clear input"
      >
        <IconX size={14} />
      </button>
    ) : rightSection;

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
        <TextInput
          ref={ref}
          id={inputId}
          name={name}
          type={type}
          value={value}
          defaultValue={defaultValue}
          onChange={handleChange}
          onBlur={onBlur}
          onFocus={onFocus}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          maxLength={maxLength}
          pattern={pattern}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          required={required}
          aria-label={ariaLabel}
          aria-describedby={ariaDescribedBy}
          aria-invalid={state === 'error'}
          data-testid={dataTestId}
          leftSection={leftSection}
          rightSection={rightSectionContent}
          error={!!error}
          classNames={{
            input: inputClasses,
          }}
          styles={{
            input: {
              minHeight: heights[size],
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
      </EMRFieldWrapper>
    );
  }
);

EMRTextInput.displayName = 'EMRTextInput';

export default EMRTextInput;
