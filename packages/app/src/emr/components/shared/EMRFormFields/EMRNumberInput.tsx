/**
 * EMRNumberInput - Standardized number input component
 * Consistent styling across all number inputs in the EMR system
 */

import React, { useId, forwardRef, useCallback } from 'react';
import { NumberInput } from '@mantine/core';
import { EMRNumberInputProps } from './EMRFieldTypes';
import { EMRFieldWrapper } from './EMRFieldWrapper';
import './emr-fields.css';

/**
 * EMRNumberInput component
 * A production-ready number input with consistent styling
 */
export const EMRNumberInput = forwardRef<HTMLInputElement, EMRNumberInputProps>(
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
      fullWidth = true,

      // NumberInput specific props
      value,
      defaultValue,
      onChange,
      onBlur,
      min,
      max,
      step = 1,
      decimalScale,
      decimalSeparator = '.',
      thousandSeparator,
      prefix,
      suffix,
      hideControls = false,
      allowNegative = true,
      clampBehavior = 'blur',
    },
    ref
  ): React.JSX.Element => {
    const generatedId = useId();
    const inputId = id || generatedId;

    // Handle change event
    const handleChange = useCallback(
      (newValue: number | string) => {
        if (onChange) {
          onChange(newValue);
        }
      },
      [onChange]
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

    // Calculate heights based on size
    const heights = {
      sm: 36,
      md: 42,
      lg: 48,
    };

    // Build input classes
    const inputClasses = [
      'emr-input',
      `size-${size}`,
      state === 'error' && 'has-error',
      state === 'success' && 'has-success',
      state === 'warning' && 'has-warning',
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
        <NumberInput
          ref={ref}
          id={inputId}
          name={name}
          value={value}
          defaultValue={defaultValue}
          onChange={handleChange}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          min={min}
          max={max}
          step={step}
          decimalScale={decimalScale}
          decimalSeparator={decimalSeparator}
          thousandSeparator={thousandSeparator}
          prefix={prefix}
          suffix={suffix}
          hideControls={hideControls}
          allowNegative={allowNegative}
          clampBehavior={clampBehavior}
          required={required}
          aria-label={ariaLabel}
          aria-describedby={ariaDescribedBy}
          aria-invalid={state === 'error'}
          data-testid={dataTestId}
          leftSection={leftSection}
          rightSection={rightSection}
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
            control: {
              borderColor: 'var(--emr-input-border)',
              '&:hover': {
                backgroundColor: 'var(--emr-hover-bg)',
              },
            },
          }}
        />
      </EMRFieldWrapper>
    );
  }
);

EMRNumberInput.displayName = 'EMRNumberInput';

export default EMRNumberInput;
