// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useState, useCallback } from 'react';
import { Menu, Button } from '@mantine/core';
import { IconDownload, IconFileSpreadsheet, IconFileText } from '@tabler/icons-react';
import { useTranslation } from '../../hooks/useTranslation';
import { exportToExcel, exportToCSV } from '../../services/exportService';
import type { AccountRowExtended, AccountSearchFiltersExtended, ExportMetadata } from '../../types/account-management';

interface ExportButtonProps {
  /** Account data to export */
  data: AccountRowExtended[];
  /** Name of the user performing the export */
  exportedBy: string;
  /** Current applied filters (for metadata) */
  filters?: AccountSearchFiltersExtended;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Callback when export completes successfully */
  onSuccess?: () => void;
  /** Callback when export fails */
  onError?: (error: Error) => void;
}

/**
 * Export button with dropdown menu for Excel and CSV export
 *
 * Features:
 * - Dropdown menu with Excel and CSV options
 * - Loading state during export
 * - Disabled when no data available
 * - Includes export metadata (timestamp, user, filters)
 * - Multilingual support (ka/en/ru)
 *
 * @param data - Array of account rows to export
 * @param exportedBy - Name of the user performing the export
 * @param filters - Current applied filters for metadata
 * @param disabled - Whether the button is disabled
 * @param onSuccess - Callback when export completes
 * @param onError - Callback when export fails
 */
export const ExportButton = React.memo(function ExportButton({
  data,
  exportedBy,
  filters,
  disabled = false,
  onSuccess,
  onError,
}: ExportButtonProps): React.ReactElement {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  // Generate filename with timestamp
  const generateFilename = useCallback((): string => {
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
    return `accounts-${dateStr}`;
  }, []);

  // Create export metadata
  const createMetadata = useCallback((): ExportMetadata => {
    return {
      timestamp: new Date().toISOString(),
      exportedBy,
      filters,
      totalRecords: data.length,
    };
  }, [exportedBy, filters, data.length]);

  // Handle Excel export
  const handleExcelExport = useCallback(async () => {
    setLoading(true);
    try {
      const filename = generateFilename();
      const metadata = createMetadata();
      exportToExcel(data, filename, metadata);
      onSuccess?.();
    } catch (error) {
      onError?.(error as Error);
    } finally {
      setLoading(false);
    }
  }, [data, generateFilename, createMetadata, onSuccess, onError]);

  // Handle CSV export
  const handleCSVExport = useCallback(async () => {
    setLoading(true);
    try {
      const filename = generateFilename();
      const metadata = createMetadata();
      exportToCSV(data, filename, metadata);
      onSuccess?.();
    } catch (error) {
      onError?.(error as Error);
    } finally {
      setLoading(false);
    }
  }, [data, generateFilename, createMetadata, onSuccess, onError]);

  // Disable button when no data or explicitly disabled
  const isDisabled = disabled || data.length === 0 || loading;

  return (
    <Menu shadow="md" width={200} position="bottom-end" disabled={isDisabled}>
      <Menu.Target>
        <Button
          variant="light"
          color="blue"
          size="sm"
          leftSection={<IconDownload size={16} />}
          disabled={isDisabled}
          loading={loading}
          data-testid="export-button"
          aria-label={t('accountManagement.export.excel')}
          style={{
            minHeight: 36,
            transition: 'var(--emr-transition-fast)',
          }}
        >
          {t('accountManagement.audit.export')}
        </Button>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Item
          leftSection={<IconFileSpreadsheet size={16} />}
          onClick={handleExcelExport}
        >
          {t('accountManagement.export.excel')}
        </Menu.Item>
        <Menu.Item
          leftSection={<IconFileText size={16} />}
          onClick={handleCSVExport}
        >
          {t('accountManagement.export.csv')}
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
});
