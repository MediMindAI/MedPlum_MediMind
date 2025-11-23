// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useMemo, useState } from 'react';
import { Switch } from '@mantine/core';
import {
  IconRefresh,
  IconDeviceFloppy,
  IconShieldCheck,
  IconUser,
  IconStethoscope,
  IconHeartbeat,
  IconPill,
  IconFileText,
  IconCalendar,
  IconShield,
  IconReceipt,
  IconBuilding,
  IconMapPin,
  IconPlus,
  IconEye,
  IconPencil,
  IconTrash,
  IconSearch,
  IconKey,
  IconFileInvoice,
  IconUserCog,
  IconShieldLock,
  IconForms,
  IconClipboardCheck,
  IconFile,
  IconList,
  IconTestPipe,
  IconFlask,
  IconDeviceDesktop,
  IconHistory,
  IconReportMedical,
  IconChevronDown,
  IconChevronRight,
  IconInfoCircle,
} from '@tabler/icons-react';
import type { PermissionRow } from '../../types/account-management';
import { PERMISSION_RESOURCES, PERMISSION_OPERATIONS } from '../../types/account-management';
import { useTranslation } from '../../hooks/useTranslation';
import styles from './PermissionMatrix.module.css';

/**
 * Resource category mapping for visual grouping
 */
const RESOURCE_CATEGORIES: Record<string, 'clinical' | 'administrative' | 'financial' | 'diagnostic'> = {
  // Clinical - Patient Data
  Patient: 'clinical',
  Encounter: 'clinical',
  Observation: 'clinical',
  MedicationRequest: 'clinical',
  DiagnosticReport: 'diagnostic',

  // Administrative - Staff & Organization
  Practitioner: 'administrative',
  PractitionerRole: 'administrative',
  AccessPolicy: 'administrative',
  Organization: 'administrative',
  Location: 'administrative',

  // Financial - Billing & Insurance
  Invoice: 'financial',
  Claim: 'financial',
  Coverage: 'financial',

  // Forms & Documents
  Questionnaire: 'administrative',
  QuestionnaireResponse: 'clinical',
  DocumentReference: 'clinical',

  // Nomenclature & Catalog
  ActivityDefinition: 'administrative',

  // Laboratory
  SpecimenDefinition: 'diagnostic',
  ObservationDefinition: 'diagnostic',
  DeviceDefinition: 'diagnostic',

  // Audit & Security
  AuditEvent: 'administrative',
};

/**
 * Resource icons mapping
 */
const RESOURCE_ICONS: Record<string, typeof IconUser> = {
  // Clinical - Patient Data
  Patient: IconUser,
  Encounter: IconCalendar,
  Observation: IconHeartbeat,
  MedicationRequest: IconPill,
  DiagnosticReport: IconReportMedical,

  // Administrative - Staff & Organization
  Practitioner: IconStethoscope,
  PractitionerRole: IconUserCog,
  AccessPolicy: IconShieldLock,
  Organization: IconBuilding,
  Location: IconMapPin,

  // Financial - Billing & Insurance
  Invoice: IconFileInvoice,
  Claim: IconReceipt,
  Coverage: IconShield,

  // Forms & Documents
  Questionnaire: IconForms,
  QuestionnaireResponse: IconClipboardCheck,
  DocumentReference: IconFile,

  // Nomenclature & Catalog
  ActivityDefinition: IconList,

  // Laboratory
  SpecimenDefinition: IconTestPipe,
  ObservationDefinition: IconFlask,
  DeviceDefinition: IconDeviceDesktop,

  // Audit & Security
  AuditEvent: IconHistory,
};

/**
 * Operation icons mapping
 */
const OPERATION_ICONS: Record<string, typeof IconPlus> = {
  create: IconPlus,
  read: IconEye,
  update: IconPencil,
  delete: IconTrash,
  search: IconSearch,
};

/**
 * Props for PermissionMatrix component
 */
export interface PermissionMatrixProps {
  /** Permission rows to display */
  permissions: PermissionRow[];
  /** Whether the matrix is in read-only mode */
  readOnly?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Whether there are unsaved changes */
  hasChanges?: boolean;
  /** Callback when a permission is toggled */
  onPermissionChange?: (resourceType: string, operation: string, value: boolean) => void;
  /** Callback to save permissions */
  onSave?: () => Promise<void>;
  /** Callback to refresh permissions */
  onRefresh?: () => Promise<void>;
}


/**
 * PermissionMatrix - Premium grid showing resources vs operations
 *
 * Displays a visually refined matrix of FHIR resource types (rows) vs CRUD operations (columns).
 * Each cell contains a custom toggle switch to control permissions.
 *
 * Features:
 * - Premium glassmorphism design
 * - Custom toggle switches instead of checkboxes
 * - Resource icons by category (clinical, administrative, financial, diagnostic)
 * - Translated resource names
 * - Mobile-first responsive design
 * - Auto-enable dependencies (update requires read)
 * - Save/refresh actions with visual feedback
 */
export function PermissionMatrix({
  permissions,
  readOnly = false,
  loading = false,
  hasChanges = false,
  onPermissionChange,
  onSave,
  onRefresh,
}: PermissionMatrixProps): JSX.Element {
  const { t } = useTranslation();

  // Track which resources are expanded
  const [expandedResources, setExpandedResources] = useState<Set<string>>(new Set());

  // Toggle resource expansion
  const toggleExpand = (resourceType: string) => {
    setExpandedResources((prev) => {
      const next = new Set(prev);
      if (next.has(resourceType)) {
        next.delete(resourceType);
      } else {
        next.add(resourceType);
      }
      return next;
    });
  };

  // Get resource description
  const getResourceDescription = (resourceType: string): string => {
    const key = `accountManagement.permissions.descriptions.${resourceType}`;
    const translated = t(key);
    return translated !== key ? translated : '';
  };

  // Create a map for quick lookup
  const permissionMap = useMemo(
    () => new Map(permissions.map((p) => [p.resourceType, p])),
    [permissions]
  );

  // Operation labels with translations
  const operationLabels: Record<string, string> = {
    create: t('accountManagement.permissions.create'),
    read: t('accountManagement.permissions.read'),
    update: t('accountManagement.permissions.update'),
    delete: t('accountManagement.permissions.delete'),
    search: t('accountManagement.permissions.search'),
  };

  // Calculate stats
  const stats = useMemo(() => {
    let enabled = 0;
    let total = 0;
    permissions.forEach((row) => {
      PERMISSION_OPERATIONS.forEach((op) => {
        total++;
        if (row[op as keyof PermissionRow]) {
          enabled++;
        }
      });
    });
    return { enabled, total };
  }, [permissions]);

  /**
   * Get translated resource name
   */
  const getResourceName = (resourceType: string): string => {
    const key = `accountManagement.permissions.resources.${resourceType}`;
    const translated = t(key);
    return translated !== key ? translated : resourceType;
  };

  /**
   * Handle toggle change
   */
  const handleToggle = (resourceType: string, operation: string, currentValue: boolean) => {
    if (readOnly || !onPermissionChange) {
      return;
    }
    onPermissionChange(resourceType, operation, !currentValue);
  };

  /**
   * Check if a permission is enabled
   */
  const isEnabled = (resourceType: string, operation: string): boolean => {
    const row = permissionMap.get(resourceType);
    if (!row) {
      return false;
    }
    return row[operation as keyof PermissionRow] as boolean;
  };

  /**
   * Handle save button click
   */
  const handleSave = async () => {
    if (onSave) {
      await onSave();
    }
  };

  /**
   * Handle refresh button click
   */
  const handleRefresh = async () => {
    if (onRefresh) {
      await onRefresh();
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className={styles.matrixContainer}>
        <div className={styles.skeletonContainer}>
          <div className={styles.skeletonHeader} />
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className={styles.skeletonRow} style={{ animationDelay: `${i * 0.1}s` }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.matrixContainer}>
      {/* Header Section */}
      <div className={styles.matrixHeader}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIcon}>
            <IconShieldCheck size={22} />
          </div>
          <div>
            <h3 className={styles.headerTitle}>{t('accountManagement.permissions.matrix')}</h3>
            <p className={styles.headerSubtitle}>
              {stats.enabled} / {stats.total} {t('accountManagement.permissions.title').toLowerCase()}
            </p>
          </div>
        </div>

        {!readOnly && (
          <div className={styles.actionButtons}>
            {onRefresh && (
              <button type="button" className={styles.refreshButton} onClick={handleRefresh}>
                <IconRefresh size={16} />
                {t('common.refresh')}
              </button>
            )}
            {onSave && (
              <button
                type="button"
                className={`${styles.saveButton} ${hasChanges ? styles.saveButtonActive : ''}`}
                onClick={handleSave}
                disabled={!hasChanges}
              >
                <IconDeviceFloppy size={16} />
                {t('common.save') || t('accountManagement.form.save')}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className={styles.quickStats}>
        <div className={`${styles.statBadge} ${stats.enabled > 0 ? styles.enabled : ''}`}>
          <IconKey size={14} />
          <span className={styles.statCount}>{stats.enabled}</span> {t('accountManagement.permissions.title')}
        </div>
      </div>

      {/* Permission Table */}
      <div className={styles.tableWrapper}>
        <table className={styles.permissionTable}>
          <thead className={styles.tableHead}>
            <tr>
              <th>{t('common.resource')}</th>
              {PERMISSION_OPERATIONS.map((op) => {
                const OperationIcon = OPERATION_ICONS[op];
                return (
                  <th key={op}>
                    <div className={styles.operationHeader}>
                      <div className={`${styles.operationIcon} ${styles[op]}`}>
                        <OperationIcon size={16} />
                      </div>
                      <span className={styles.operationLabel}>{operationLabels[op]}</span>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className={styles.tableBody}>
            {PERMISSION_RESOURCES.map((resourceType) => {
              const category = RESOURCE_CATEGORIES[resourceType] || 'clinical';
              const ResourceIcon = RESOURCE_ICONS[resourceType] || IconFileText;
              const isExpanded = expandedResources.has(resourceType);
              const description = getResourceDescription(resourceType);

              return (
                <React.Fragment key={resourceType}>
                  <tr className={isExpanded ? styles.expandedRow : ''}>
                    <td>
                      <div className={styles.resourceCell}>
                        <button
                          type="button"
                          className={styles.expandButton}
                          onClick={() => toggleExpand(resourceType)}
                          aria-label={isExpanded ? 'Collapse' : 'Expand'}
                        >
                          {isExpanded ? <IconChevronDown size={16} /> : <IconChevronRight size={16} />}
                        </button>
                        <div className={`${styles.resourceIcon} ${styles[category]}`}>
                          <ResourceIcon size={18} />
                        </div>
                        <div className={styles.resourceInfo}>
                          <span className={styles.resourceName}>{getResourceName(resourceType)}</span>
                          <span className={styles.resourceCode}>{resourceType}</span>
                        </div>
                      </div>
                    </td>
                    {PERMISSION_OPERATIONS.map((operation) => {
                      const enabled = isEnabled(resourceType, operation);
                      return (
                        <td key={operation} className={styles.toggleCell}>
                          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <Switch
                              checked={enabled}
                              onChange={() => handleToggle(resourceType, operation, enabled)}
                              disabled={readOnly}
                              aria-label={`${resourceType} ${operation}`}
                              size="md"
                              color="teal"
                              styles={{
                                track: {
                                  cursor: readOnly ? 'not-allowed' : 'pointer',
                                },
                              }}
                            />
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                  {isExpanded && description && (
                    <tr key={`${resourceType}-description`} className={styles.descriptionRow}>
                      <td colSpan={6}>
                        <div className={styles.descriptionContent}>
                          <IconInfoCircle size={16} className={styles.descriptionIcon} />
                          <span>{description}</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Unsaved Changes Indicator */}
      {hasChanges && !readOnly && (
        <div className={styles.unsavedIndicator}>
          <span className={styles.unsavedDot} />
          <span className={styles.unsavedText}>
            {t('common.unsavedChanges') || t('formUI.messages.unsavedChanges') || 'You have unsaved changes'}
          </span>
        </div>
      )}
    </div>
  );
}
