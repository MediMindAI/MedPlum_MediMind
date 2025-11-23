/**
 * EMRFormSection - Collapsible form section with blue border accent
 * Matches the existing EMR collapsible section design pattern
 */

import React, { useState, useCallback } from 'react';
import { IconChevronDown } from '@tabler/icons-react';
import { EMRFormSectionProps } from './EMRFieldTypes';
import './emr-fields.css';

/**
 * EMRFormSection component
 * A collapsible section with icon, title, and blue accent border
 */
export function EMRFormSection({
  title,
  icon: Icon,
  children,
  defaultOpen = true,
  open: controlledOpen,
  onOpenChange,
  borderColor,
  className = '',
  style,
  'data-testid': dataTestId,
}: EMRFormSectionProps): React.JSX.Element {
  // Internal state for uncontrolled mode
  const [internalOpen, setInternalOpen] = useState(defaultOpen);

  // Determine if controlled or uncontrolled
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;

  // Handle toggle
  const handleToggle = useCallback(() => {
    if (isControlled) {
      onOpenChange?.(!controlledOpen);
    } else {
      setInternalOpen((prev) => !prev);
    }
  }, [isControlled, controlledOpen, onOpenChange]);

  // Build section classes
  const sectionClasses = [
    'emr-form-section',
    isOpen && 'open',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // Custom border color style
  const sectionStyle: React.CSSProperties = {
    ...style,
    ...(borderColor ? { borderColor } : {}),
  };

  return (
    <div className={sectionClasses} style={sectionStyle} data-testid={dataTestId}>
      {/* Header */}
      <div
        className="emr-form-section-header"
        onClick={handleToggle}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleToggle();
          }
        }}
        aria-expanded={isOpen}
      >
        <div className="emr-form-section-title">
          {Icon && (
            <span className="emr-form-section-icon">
              <Icon size={20} stroke="1.5" />
            </span>
          )}
          <span>{title}</span>
        </div>
        <IconChevronDown
          size={20}
          className="emr-form-section-chevron"
          stroke={1.5}
        />
      </div>

      {/* Content */}
      <div className="emr-form-section-content">
        {children}
      </div>
    </div>
  );
}

export default EMRFormSection;
