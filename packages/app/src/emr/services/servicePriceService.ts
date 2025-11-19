// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import type { ActivityDefinition, Extension } from '@medplum/fhirtypes';

/**
 * Price entry for a service with effective date and insurance company
 */
export interface PriceEntry {
  id?: string;
  priceType: string; // Insurance company name (e.g., "შიდა სტაციონარი")
  insuranceCompanyCode?: string; // Numeric code (0, 1, 2, etc.)
  effectiveDate: string; // ISO format: YYYY-MM-DD
  amount: number; // Price value
  currency: string; // Currency code (GEL, USD, EUR)
}

/**
 * Extension URL for service price configuration
 */
const SERVICE_PRICE_EXTENSION_URL = 'http://medimind.ge/fhir/extension/service-price';

/**
 * Get all price entries from an ActivityDefinition
 *
 * @param service - ActivityDefinition resource
 * @returns Array of price entries
 */
export function getServicePrices(service: ActivityDefinition): PriceEntry[] {
  if (!service.extension) {
    return [];
  }

  const priceExtensions = service.extension.filter((ext) => ext.url === SERVICE_PRICE_EXTENSION_URL);

  return priceExtensions.map((priceExt) => {
    const priceTypeExt = priceExt.extension?.find((e) => e.url === 'priceType');
    const effectiveDateExt = priceExt.extension?.find((e) => e.url === 'effectiveDate');
    const amountExt = priceExt.extension?.find((e) => e.url === 'amount');
    const insuranceCodeExt = priceExt.extension?.find((e) => e.url === 'insuranceCompanyCode');

    return {
      id: `price-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      priceType: priceTypeExt?.valueString || '',
      insuranceCompanyCode: insuranceCodeExt?.valueString,
      effectiveDate: effectiveDateExt?.valueDate || '',
      amount: amountExt?.valueMoney?.value || 0,
      currency: amountExt?.valueMoney?.currency || 'GEL',
    };
  });
}

/**
 * Add a new price entry to an ActivityDefinition
 *
 * Creates a new service-price extension with the provided price entry data.
 * Returns a new ActivityDefinition object with the price entry added (immutable).
 *
 * @param service - ActivityDefinition resource
 * @param price - Price entry to add
 * @returns Updated ActivityDefinition with new price entry
 */
export function addServicePrice(service: ActivityDefinition, price: PriceEntry): ActivityDefinition {
  const priceExtension: Extension = {
    url: SERVICE_PRICE_EXTENSION_URL,
    extension: [
      {
        url: 'priceType',
        valueString: price.priceType,
      },
      {
        url: 'effectiveDate',
        valueDate: price.effectiveDate,
      },
      {
        url: 'amount',
        valueMoney: {
          value: price.amount,
          currency: price.currency,
        },
      },
    ],
  };

  // Add insurance company code if provided
  if (price.insuranceCompanyCode) {
    priceExtension.extension?.push({
      url: 'insuranceCompanyCode',
      valueString: price.insuranceCompanyCode,
    });
  }

  return {
    ...service,
    extension: [...(service.extension || []), priceExtension],
  };
}

/**
 * Update an existing price entry in an ActivityDefinition
 *
 * Finds the price entry at the specified index and replaces it with the updated data.
 * Returns a new ActivityDefinition object with the price entry updated (immutable).
 *
 * @param service - ActivityDefinition resource
 * @param index - Index of the price entry to update (0-based)
 * @param price - Updated price entry data
 * @returns Updated ActivityDefinition with price entry modified
 */
export function updateServicePrice(
  service: ActivityDefinition,
  index: number,
  price: PriceEntry
): ActivityDefinition {
  if (!service.extension) {
    return service;
  }

  const priceExtensions = service.extension.filter((ext) => ext.url === SERVICE_PRICE_EXTENSION_URL);
  const otherExtensions = service.extension.filter((ext) => ext.url !== SERVICE_PRICE_EXTENSION_URL);

  if (index < 0 || index >= priceExtensions.length) {
    throw new Error(`Price entry index ${index} out of bounds (0-${priceExtensions.length - 1})`);
  }

  // Create updated price extension
  const updatedPriceExtension: Extension = {
    url: SERVICE_PRICE_EXTENSION_URL,
    extension: [
      {
        url: 'priceType',
        valueString: price.priceType,
      },
      {
        url: 'effectiveDate',
        valueDate: price.effectiveDate,
      },
      {
        url: 'amount',
        valueMoney: {
          value: price.amount,
          currency: price.currency,
        },
      },
    ],
  };

  // Add insurance company code if provided
  if (price.insuranceCompanyCode) {
    updatedPriceExtension.extension?.push({
      url: 'insuranceCompanyCode',
      valueString: price.insuranceCompanyCode,
    });
  }

  // Replace the price extension at the specified index
  const updatedPriceExtensions = [
    ...priceExtensions.slice(0, index),
    updatedPriceExtension,
    ...priceExtensions.slice(index + 1),
  ];

  return {
    ...service,
    extension: [...otherExtensions, ...updatedPriceExtensions],
  };
}

/**
 * Delete a price entry from an ActivityDefinition
 *
 * Removes the price entry at the specified index.
 * Returns a new ActivityDefinition object with the price entry removed (immutable).
 *
 * @param service - ActivityDefinition resource
 * @param index - Index of the price entry to delete (0-based)
 * @returns Updated ActivityDefinition with price entry removed
 */
export function deleteServicePrice(service: ActivityDefinition, index: number): ActivityDefinition {
  if (!service.extension) {
    return service;
  }

  const priceExtensions = service.extension.filter((ext) => ext.url === SERVICE_PRICE_EXTENSION_URL);
  const otherExtensions = service.extension.filter((ext) => ext.url !== SERVICE_PRICE_EXTENSION_URL);

  if (index < 0 || index >= priceExtensions.length) {
    throw new Error(`Price entry index ${index} out of bounds (0-${priceExtensions.length - 1})`);
  }

  // Remove the price extension at the specified index
  const updatedPriceExtensions = [...priceExtensions.slice(0, index), ...priceExtensions.slice(index + 1)];

  return {
    ...service,
    extension: [...otherExtensions, ...updatedPriceExtensions],
  };
}

/**
 * Find price entry by effective date and insurance company code
 *
 * @param service - ActivityDefinition resource
 * @param effectiveDate - Effective date to search for
 * @param insuranceCompanyCode - Insurance company code to search for
 * @returns Price entry if found, undefined otherwise
 */
export function findPriceEntry(
  service: ActivityDefinition,
  effectiveDate: string,
  insuranceCompanyCode?: string
): PriceEntry | undefined {
  const prices = getServicePrices(service);
  return prices.find(
    (p) => p.effectiveDate === effectiveDate && p.insuranceCompanyCode === insuranceCompanyCode
  );
}

/**
 * Get the most recent price for a given insurance company as of a specific date
 *
 * Returns the price entry with the most recent effective date that is on or before
 * the specified date. This implements the business logic for price history lookup.
 *
 * @param service - ActivityDefinition resource
 * @param asOfDate - Date to find the applicable price (ISO format: YYYY-MM-DD)
 * @param insuranceCompanyCode - Insurance company code (optional, defaults to "0" - Internal)
 * @returns Most recent applicable price entry, or undefined if none found
 */
export function getMostRecentPrice(
  service: ActivityDefinition,
  asOfDate: string,
  insuranceCompanyCode = '0'
): PriceEntry | undefined {
  const prices = getServicePrices(service);

  // Filter prices for the specified insurance company and effective date <= asOfDate
  const applicablePrices = prices.filter(
    (p) => p.insuranceCompanyCode === insuranceCompanyCode && p.effectiveDate <= asOfDate
  );

  if (applicablePrices.length === 0) {
    return undefined;
  }

  // Sort by effective date descending and return the first (most recent)
  return applicablePrices.sort((a, b) => b.effectiveDate.localeCompare(a.effectiveDate))[0];
}
