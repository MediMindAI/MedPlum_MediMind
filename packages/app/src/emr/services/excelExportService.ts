// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import * as XLSX from 'xlsx';
import type { ServiceTableRow, ExcelExportOptions } from '../types/nomenclature';

/**
 * Export medical services to Excel (.xlsx) file with Georgian text support
 *
 * Features:
 * - UTF-8 BOM for proper Georgian character encoding
 * - Custom column selection and ordering
 * - Formatted currency values (GEL)
 * - Boolean to Yes/No conversion
 * - Automatic file download
 * - 15 fields support matching ServiceTableRow
 *
 * Usage:
 * ```typescript
 * import { exportServicesToExcel } from '@/emr/services/excelExportService';
 *
 * exportServicesToExcel(services, {
 *   fileName: 'medical-services-2025-11-18.xlsx',
 *   columns: ['code', 'name', 'group', 'type', 'price']
 * });
 * ```
 */

/**
 * Column header translations for Georgian language
 */
const COLUMN_HEADERS_KA: Record<string, string> = {
  code: 'კოდი',
  name: 'დასახელება',
  group: 'ჯგუფი',
  subgroup: 'ქვეჯგუფი',
  type: 'ტიპი',
  serviceCategory: 'კატეგორია',
  price: 'ფასი (₾)',
  totalAmount: 'ჯამი (₾)',
  calHed: 'კალკულაცია',
  printable: 'დაბეჭდვადი',
  itemGetPrice: 'ერთეულის ფასი',
  departments: 'დეპარტამენტები',
  lisIntegration: 'LIS ინტეგრაცია',
  lisProvider: 'LIS პროვაიდერი',
  externalOrderCode: 'გარე შეკვეთის კოდი',
  gisCode: 'GIS კოდი',
  status: 'სტატუსი',
};

/**
 * Column header translations for English language
 */
const COLUMN_HEADERS_EN: Record<string, string> = {
  code: 'Code',
  name: 'Name',
  group: 'Group',
  subgroup: 'Subgroup',
  type: 'Type',
  serviceCategory: 'Category',
  price: 'Price (GEL)',
  totalAmount: 'Total Amount (GEL)',
  calHed: 'Calculation',
  printable: 'Printable',
  itemGetPrice: 'Item Price',
  departments: 'Departments',
  lisIntegration: 'LIS Integration',
  lisProvider: 'LIS Provider',
  externalOrderCode: 'External Order Code',
  gisCode: 'GIS Code',
  status: 'Status',
};

/**
 * Column header translations for Russian language
 */
const COLUMN_HEADERS_RU: Record<string, string> = {
  code: 'Код',
  name: 'Название',
  group: 'Группа',
  subgroup: 'Подгруппа',
  type: 'Тип',
  serviceCategory: 'Категория',
  price: 'Цена (₾)',
  totalAmount: 'Сумма (₾)',
  calHed: 'Калькуляция',
  printable: 'Печатаемый',
  itemGetPrice: 'Цена единицы',
  departments: 'Департаменты',
  lisIntegration: 'Интеграция LIS',
  lisProvider: 'Провайдер LIS',
  externalOrderCode: 'Код внешнего заказа',
  gisCode: 'Код GIS',
  status: 'Статус',
};

/**
 * Get column headers based on language
 * @param lang
 */
function getColumnHeaders(lang: string = 'ka'): Record<string, string> {
  switch (lang) {
    case 'en':
      return COLUMN_HEADERS_EN;
    case 'ru':
      return COLUMN_HEADERS_RU;
    default:
      return COLUMN_HEADERS_KA;
  }
}

/**
 * Default columns to export if none specified
 */
const DEFAULT_COLUMNS: (keyof ServiceTableRow)[] = [
  'code',
  'name',
  'group',
  'type',
  'price',
  'totalAmount',
  'calHed',
  'printable',
  'itemGetPrice',
  'status',
];

/**
 * Format boolean value to Yes/No in Georgian
 * @param value
 * @param lang
 */
function formatBoolean(value: boolean | undefined, lang: string = 'ka'): string {
  if (value === undefined) {return '-';}

  switch (lang) {
    case 'en':
      return value ? 'Yes' : 'No';
    case 'ru':
      return value ? 'Да' : 'Нет';
    default: // Georgian
      return value ? 'დიახ' : 'არა';
  }
}

/**
 * Format currency value (GEL)
 * @param value
 */
function formatCurrency(value: number | undefined): string {
  if (value === undefined || value === null) {return '-';}
  return value.toFixed(2);
}

/**
 * Format number or return dash if undefined
 * @param value
 */
function formatNumber(value: number | undefined): string | number {
  if (value === undefined || value === null) {return '-';}
  return value;
}

/**
 * Format array to comma-separated string
 * @param value
 */
function formatArray(value: string[] | undefined): string {
  if (!value || value.length === 0) {return '-';}
  return value.join(', ');
}

/**
 * Format status for display
 * @param status
 * @param lang
 */
function formatStatus(status: string | undefined, lang: string = 'ka'): string {
  if (!status) {return '-';}

  switch (lang) {
    case 'en':
      return status === 'active' ? 'Active' : status === 'retired' ? 'Retired' : 'Draft';
    case 'ru':
      return status === 'active' ? 'Активный' : status === 'retired' ? 'Удалённый' : 'Черновик';
    default: // Georgian
      return status === 'active' ? 'აქტიური' : status === 'retired' ? 'წაშლილი' : 'მომზადებული';
  }
}

/**
 * Convert ServiceTableRow to Excel-friendly row object
 * @param service
 * @param columns
 * @param headers
 * @param lang
 */
function convertToExcelRow(
  service: ServiceTableRow,
  columns: (keyof ServiceTableRow)[],
  headers: Record<string, string>,
  lang: string = 'ka'
): Record<string, string | number> {
  const row: Record<string, string | number> = {};

  columns.forEach((col) => {
    const header = headers[col] || col;
    const value = service[col];

    switch (col) {
      case 'price':
      case 'totalAmount':
        row[header] = formatCurrency(value as number | undefined);
        break;
      case 'printable':
      case 'lisIntegration':
        row[header] = formatBoolean(value as boolean | undefined, lang);
        break;
      case 'calHed':
      case 'itemGetPrice':
        row[header] = formatNumber(value as number | undefined);
        break;
      case 'departments':
        row[header] = formatArray(value as string[] | undefined);
        break;
      case 'status':
        row[header] = formatStatus(value as string | undefined, lang);
        break;
      case 'code':
      case 'name':
      case 'group':
      case 'type':
      case 'subgroup':
      case 'serviceCategory':
      case 'lisProvider':
      case 'externalOrderCode':
      case 'gisCode':
      default:
        row[header] = (value as string) || '-';
        break;
    }
  });

  return row;
}

/**
 * Generate Excel worksheet from services data
 * @param services
 * @param columns
 * @param lang
 */
function generateWorksheet(
  services: ServiceTableRow[],
  columns: (keyof ServiceTableRow)[],
  lang: string = 'ka'
): XLSX.WorkSheet {
  const headers = getColumnHeaders(lang);

  // Convert services to Excel-friendly rows
  const excelRows = services.map((service) => convertToExcelRow(service, columns, headers, lang));

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(excelRows);

  // Set column widths for better readability
  const columnWidths: XLSX.ColInfo[] = columns.map((col) => {
    switch (col) {
      case 'code':
        return { wch: 12 };
      case 'name':
        return { wch: 50 };
      case 'group':
      case 'type':
      case 'subgroup':
        return { wch: 30 };
      case 'price':
      case 'totalAmount':
        return { wch: 15 };
      case 'calHed':
      case 'itemGetPrice':
        return { wch: 12 };
      case 'printable':
      case 'lisIntegration':
        return { wch: 15 };
      case 'departments':
        return { wch: 40 };
      case 'status':
        return { wch: 12 };
      default:
        return { wch: 20 };
    }
  });

  worksheet['!cols'] = columnWidths;

  return worksheet;
}

/**
 * Trigger browser download of Excel file
 * @param workbook
 * @param fileName
 */
function downloadFile(workbook: XLSX.WorkBook, fileName: string): void {
  // Generate Excel file buffer with UTF-8 BOM for Georgian text support
  const excelBuffer = XLSX.write(workbook, {
    bookType: 'xlsx',
    type: 'array',
    compression: true,
  });

  // Create Blob with proper MIME type
  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
  });

  // Create download link and trigger download
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();

  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export medical services to Excel file
 *
 * @param services - Array of service rows to export
 * @param options - Export configuration options
 * @param lang - Language for column headers (ka/en/ru)
 *
 * @example
 * ```typescript
 * exportServicesToExcel(services, {
 *   fileName: 'medical-services-2025-11-18.xlsx',
 *   columns: ['code', 'name', 'group', 'type', 'price']
 * }, 'ka');
 * ```
 */
export function exportServicesToExcel(
  services: ServiceTableRow[],
  options: ExcelExportOptions = {},
  lang: string = 'ka'
): void {
  // Extract options with defaults
  const { columns = DEFAULT_COLUMNS, fileName = `medical-services-${new Date().toISOString().split('T')[0]}.xlsx` } =
    options;

  // Validate inputs
  if (!services || services.length === 0) {
    console.warn('No services to export');
    return;
  }

  try {
    // Generate worksheet
    const worksheet = generateWorksheet(services, columns, lang);

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Services');

    // Trigger download
    downloadFile(workbook, fileName);

    console.log(`✅ Exported ${services.length} services to ${fileName}`);
  } catch (error) {
    console.error('Failed to export services to Excel:', error);
    throw new Error(`Excel export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get current date for default filename
 */
export function getDefaultFileName(): string {
  const today = new Date().toISOString().split('T')[0];
  return `medical-services-${today}.xlsx`;
}
