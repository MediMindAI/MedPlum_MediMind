// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import type { ActivityDefinition, Extension, Reference } from '@medplum/fhirtypes';

/**
 * Service color configuration
 */
export interface ServiceColor {
  colorCategory?: string; // Color category name (e.g., "ინსტრუმენტული კვლევები")
  hexCode: string; // HEX color code (#RRGGBB)
}

/**
 * Time range for online blocking hours
 */
export interface TimeRange {
  id?: string;
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
}

/**
 * Equipment or consumable item
 */
export interface Equipment {
  id?: string;
  equipmentId: string; // Reference to Device resource
  equipmentName: string; // Display name
  quantity: number; // Quantity required (positive integer)
}

/**
 * Extension URLs for service attributes
 */
const SERVICE_COLOR_EXTENSION_URL = 'http://medimind.ge/fhir/extension/service-color';
const ONLINE_BLOCKING_EXTENSION_URL = 'http://medimind.ge/fhir/extension/online-blocking-hours';
const REQUIRED_EQUIPMENT_EXTENSION_URL = 'http://medimind.ge/fhir/extension/required-equipment';

/**
 * Update service color configuration
 *
 * Sets the color category and HEX code for the service.
 * The color is used for visual identification in calendars and schedules.
 *
 * @param service - ActivityDefinition resource
 * @param colorCategory - Color category name (e.g., "ინსტრუმენტული კვლევები")
 * @param hexCode - HEX color code in #RRGGBB format
 * @returns Updated ActivityDefinition with color configured
 */
export function updateServiceColor(
  service: ActivityDefinition,
  colorCategory: string,
  hexCode: string
): ActivityDefinition {
  // Validate HEX code format
  if (!/^#[0-9A-Fa-f]{6}$/.test(hexCode)) {
    throw new Error(`Invalid HEX color code: ${hexCode}. Expected format: #RRGGBB`);
  }

  // Remove existing color extension
  const otherExtensions = (service.extension || []).filter((ext) => ext.url !== SERVICE_COLOR_EXTENSION_URL);

  const colorExtension: Extension = {
    url: SERVICE_COLOR_EXTENSION_URL,
    extension: [
      {
        url: 'colorCategory',
        valueString: colorCategory,
      },
      {
        url: 'hexCode',
        valueString: hexCode.toUpperCase(), // Normalize to uppercase
      },
    ],
  };

  return {
    ...service,
    extension: [...otherExtensions, colorExtension],
  };
}

/**
 * Get service color configuration
 *
 * @param service - ActivityDefinition resource
 * @returns Service color configuration or undefined if not set
 */
export function getServiceColor(service: ActivityDefinition): ServiceColor | undefined {
  const colorExt = service.extension?.find((ext) => ext.url === SERVICE_COLOR_EXTENSION_URL);
  if (!colorExt?.extension) {
    return undefined;
  }

  const categoryExt = colorExt.extension.find((e) => e.url === 'colorCategory');
  const hexExt = colorExt.extension.find((e) => e.url === 'hexCode');

  if (!hexExt?.valueString) {
    return undefined;
  }

  return {
    colorCategory: categoryExt?.valueString,
    hexCode: hexExt.valueString,
  };
}

/**
 * Add a time range for online blocking hours
 *
 * Online blocking hours define when the service CANNOT be booked online.
 * Multiple time ranges can be configured for a service.
 *
 * @param service - ActivityDefinition resource
 * @param timeRange - Time range to add (startTime and endTime in HH:MM format)
 * @returns Updated ActivityDefinition with time range added
 */
export function addBlockingHours(service: ActivityDefinition, timeRange: TimeRange): ActivityDefinition {
  // Validate time format
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  if (!timeRegex.test(timeRange.startTime) || !timeRegex.test(timeRange.endTime)) {
    throw new Error('Invalid time format. Expected HH:MM (24-hour format)');
  }

  // Validate start < end
  if (timeRange.startTime >= timeRange.endTime) {
    throw new Error('Start time must be before end time');
  }

  const timeRangeExtension: Extension = {
    url: 'timeRange',
    extension: [
      { url: 'startTime', valueTime: timeRange.startTime },
      { url: 'endTime', valueTime: timeRange.endTime },
    ],
  };

  // Find or create blocking hours extension
  const otherExtensions = (service.extension || []).filter((ext) => ext.url !== ONLINE_BLOCKING_EXTENSION_URL);
  const blockingExt = service.extension?.find((ext) => ext.url === ONLINE_BLOCKING_EXTENSION_URL);

  const updatedBlockingExt: Extension = {
    url: ONLINE_BLOCKING_EXTENSION_URL,
    extension: [...(blockingExt?.extension || []), timeRangeExtension],
  };

  return {
    ...service,
    extension: [...otherExtensions, updatedBlockingExt],
  };
}

/**
 * Remove a time range from online blocking hours
 *
 * @param service - ActivityDefinition resource
 * @param index - Index of the time range to remove (0-based)
 * @returns Updated ActivityDefinition with time range removed
 */
export function removeBlockingHours(service: ActivityDefinition, index: number): ActivityDefinition {
  const blockingExt = service.extension?.find((ext) => ext.url === ONLINE_BLOCKING_EXTENSION_URL);
  if (!blockingExt?.extension) {
    return service; // No blocking hours configured
  }

  if (index < 0 || index >= blockingExt.extension.length) {
    throw new Error(`Time range index ${index} out of bounds (0-${blockingExt.extension.length - 1})`);
  }

  const otherExtensions = (service.extension || []).filter((ext) => ext.url !== ONLINE_BLOCKING_EXTENSION_URL);
  const updatedTimeRanges = [
    ...blockingExt.extension.slice(0, index),
    ...blockingExt.extension.slice(index + 1),
  ];

  if (updatedTimeRanges.length === 0) {
    // No more time ranges - remove the extension entirely
    return {
      ...service,
      extension: otherExtensions.length > 0 ? otherExtensions : undefined,
    };
  }

  const updatedBlockingExt: Extension = {
    url: ONLINE_BLOCKING_EXTENSION_URL,
    extension: updatedTimeRanges,
  };

  return {
    ...service,
    extension: [...otherExtensions, updatedBlockingExt],
  };
}

/**
 * Get all online blocking hours for a service
 *
 * @param service - ActivityDefinition resource
 * @returns Array of time ranges
 */
export function getBlockingHours(service: ActivityDefinition): TimeRange[] {
  const blockingExt = service.extension?.find((ext) => ext.url === ONLINE_BLOCKING_EXTENSION_URL);
  if (!blockingExt?.extension) {
    return [];
  }

  return blockingExt.extension.map((rangeExt) => {
    const startExt = rangeExt.extension?.find((e) => e.url === 'startTime');
    const endExt = rangeExt.extension?.find((e) => e.url === 'endTime');

    return {
      id: `time-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      startTime: startExt?.valueTime || '00:00',
      endTime: endExt?.valueTime || '23:59',
    };
  });
}

/**
 * Add equipment or consumable requirement to a service
 *
 * Defines what equipment and consumables are required when performing this service.
 *
 * @param service - ActivityDefinition resource
 * @param equipment - Equipment item to add
 * @returns Updated ActivityDefinition with equipment added
 */
export function addEquipment(service: ActivityDefinition, equipment: Equipment): ActivityDefinition {
  // Validate quantity
  if (equipment.quantity <= 0) {
    throw new Error('Equipment quantity must be greater than 0');
  }

  const equipmentExtension: Extension = {
    url: 'equipment',
    extension: [
      {
        url: 'equipmentReference',
        valueReference: {
          reference: `Device/${equipment.equipmentId}`,
          display: equipment.equipmentName,
        },
      },
      {
        url: 'quantity',
        valueInteger: equipment.quantity,
      },
    ],
  };

  // Find or create equipment extension
  const otherExtensions = (service.extension || []).filter((ext) => ext.url !== REQUIRED_EQUIPMENT_EXTENSION_URL);
  const equipmentExt = service.extension?.find((ext) => ext.url === REQUIRED_EQUIPMENT_EXTENSION_URL);

  const updatedEquipmentExt: Extension = {
    url: REQUIRED_EQUIPMENT_EXTENSION_URL,
    extension: [...(equipmentExt?.extension || []), equipmentExtension],
  };

  return {
    ...service,
    extension: [...otherExtensions, updatedEquipmentExt],
  };
}

/**
 * Remove equipment or consumable from a service
 *
 * @param service - ActivityDefinition resource
 * @param index - Index of the equipment item to remove (0-based)
 * @returns Updated ActivityDefinition with equipment removed
 */
export function removeEquipment(service: ActivityDefinition, index: number): ActivityDefinition {
  const equipmentExt = service.extension?.find((ext) => ext.url === REQUIRED_EQUIPMENT_EXTENSION_URL);
  if (!equipmentExt?.extension) {
    return service; // No equipment configured
  }

  if (index < 0 || index >= equipmentExt.extension.length) {
    throw new Error(`Equipment index ${index} out of bounds (0-${equipmentExt.extension.length - 1})`);
  }

  const otherExtensions = (service.extension || []).filter((ext) => ext.url !== REQUIRED_EQUIPMENT_EXTENSION_URL);
  const updatedEquipmentItems = [
    ...equipmentExt.extension.slice(0, index),
    ...equipmentExt.extension.slice(index + 1),
  ];

  if (updatedEquipmentItems.length === 0) {
    // No more equipment - remove the extension entirely
    return {
      ...service,
      extension: otherExtensions.length > 0 ? otherExtensions : undefined,
    };
  }

  const updatedEquipmentExt: Extension = {
    url: REQUIRED_EQUIPMENT_EXTENSION_URL,
    extension: updatedEquipmentItems,
  };

  return {
    ...service,
    extension: [...otherExtensions, updatedEquipmentExt],
  };
}

/**
 * Get all required equipment for a service
 *
 * @param service - ActivityDefinition resource
 * @returns Array of equipment items
 */
export function getRequiredEquipment(service: ActivityDefinition): Equipment[] {
  const equipmentExt = service.extension?.find((ext) => ext.url === REQUIRED_EQUIPMENT_EXTENSION_URL);
  if (!equipmentExt?.extension) {
    return [];
  }

  return equipmentExt.extension.map((itemExt) => {
    const refExt = itemExt.extension?.find((e) => e.url === 'equipmentReference');
    const qtyExt = itemExt.extension?.find((e) => e.url === 'quantity');

    const reference = refExt?.valueReference?.reference || '';
    const equipmentId = reference.split('/')[1] || '';

    return {
      id: `equipment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      equipmentId,
      equipmentName: refExt?.valueReference?.display || '',
      quantity: qtyExt?.valueInteger || 1,
    };
  });
}

/**
 * Update equipment quantity
 *
 * @param service - ActivityDefinition resource
 * @param index - Index of the equipment item to update (0-based)
 * @param quantity - New quantity value
 * @returns Updated ActivityDefinition with quantity modified
 */
export function updateEquipmentQuantity(
  service: ActivityDefinition,
  index: number,
  quantity: number
): ActivityDefinition {
  if (quantity <= 0) {
    throw new Error('Equipment quantity must be greater than 0');
  }

  const equipment = getRequiredEquipment(service);
  if (index < 0 || index >= equipment.length) {
    throw new Error(`Equipment index ${index} out of bounds (0-${equipment.length - 1})`);
  }

  const updatedEquipment = { ...equipment[index], quantity };
  const serviceAfterRemove = removeEquipment(service, index);
  return addEquipment(serviceAfterRemove, updatedEquipment);
}

/**
 * Check if a time slot is blocked for online booking
 *
 * Determines if a given time is within any of the configured blocking hours.
 *
 * @param service - ActivityDefinition resource
 * @param time - Time to check (HH:MM format)
 * @returns True if the time is blocked for online booking
 */
export function isTimeBlocked(service: ActivityDefinition, time: string): boolean {
  const blockingHours = getBlockingHours(service);

  return blockingHours.some((range) => time >= range.startTime && time <= range.endTime);
}

/**
 * Get complete service attributes configuration
 *
 * Returns a summary of all service attributes including color, blocking hours, and equipment.
 *
 * @param service - ActivityDefinition resource
 * @returns Service attributes summary
 */
export function getServiceAttributes(service: ActivityDefinition): {
  color?: ServiceColor;
  blockingHours: TimeRange[];
  equipment: Equipment[];
} {
  return {
    color: getServiceColor(service),
    blockingHours: getBlockingHours(service),
    equipment: getRequiredEquipment(service),
  };
}
