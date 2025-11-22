// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import type { QuestionnaireItem, QuestionnaireItemEnableWhen, Coding } from '@medplum/fhirtypes';

/**
 * Condition evaluation result
 */
export interface EvaluationResult {
  isEnabled: boolean;
  evaluatedConditions: ConditionEvaluationDetail[];
}

/**
 * Details of a single condition evaluation
 */
export interface ConditionEvaluationDetail {
  questionId: string;
  operator: string;
  expectedValue: any;
  actualValue: any;
  result: boolean;
}

/**
 * Evaluate whether a questionnaire item should be enabled based on enableWhen conditions
 *
 * @param item - The QuestionnaireItem to evaluate
 * @param formValues - Current form values keyed by linkId
 * @param depth - Current nesting depth (for nested condition tracking)
 * @returns Evaluation result with details
 *
 * @example
 * ```typescript
 * const item = {
 *   linkId: 'showIfYes',
 *   enableWhen: [{ question: 'hasCondition', operator: '=', answerBoolean: true }],
 *   enableBehavior: 'all'
 * };
 * const formValues = { hasCondition: true };
 * const result = evaluateEnableWhen(item, formValues);
 * console.log(result.isEnabled); // true
 * ```
 */
export function evaluateEnableWhen(
  item: QuestionnaireItem,
  formValues: Record<string, any>,
  depth = 0
): EvaluationResult {
  // Max depth check (3 levels as per spec)
  const MAX_DEPTH = 3;
  if (depth >= MAX_DEPTH) {
    console.warn(`ConditionalLogic: Maximum nesting depth (${MAX_DEPTH}) reached for item ${item.linkId}`);
    return { isEnabled: true, evaluatedConditions: [] };
  }

  // No enableWhen conditions means always enabled
  if (!item.enableWhen || item.enableWhen.length === 0) {
    return { isEnabled: true, evaluatedConditions: [] };
  }

  const evaluatedConditions: ConditionEvaluationDetail[] = [];
  const results: boolean[] = [];

  for (const condition of item.enableWhen) {
    const result = evaluateSingleCondition(condition, formValues);
    evaluatedConditions.push(result);
    results.push(result.result);
  }

  // Determine final result based on enableBehavior
  const enableBehavior = item.enableBehavior || 'all';
  const isEnabled = enableBehavior === 'all'
    ? results.every((r) => r)
    : results.some((r) => r);

  return { isEnabled, evaluatedConditions };
}

/**
 * Evaluate a single enableWhen condition
 *
 * @param condition - The enableWhen condition to evaluate
 * @param formValues - Current form values keyed by linkId
 * @returns Evaluation detail for this condition
 */
export function evaluateSingleCondition(
  condition: QuestionnaireItemEnableWhen,
  formValues: Record<string, any>
): ConditionEvaluationDetail {
  const questionValue = formValues[condition.question];
  const expectedValue = getExpectedValue(condition);
  let result = false;

  switch (condition.operator) {
    case 'exists':
      // Check if the value exists (not undefined/null)
      result = questionValue !== undefined && questionValue !== null;
      // If answerBoolean is false, invert the result
      if (condition.answerBoolean === false) {
        result = !result;
      }
      break;

    case '=':
      result = compareValues(questionValue, expectedValue, '=');
      break;

    case '!=':
      result = compareValues(questionValue, expectedValue, '!=');
      break;

    case '>':
      result = compareValues(questionValue, expectedValue, '>');
      break;

    case '<':
      result = compareValues(questionValue, expectedValue, '<');
      break;

    case '>=':
      result = compareValues(questionValue, expectedValue, '>=');
      break;

    case '<=':
      result = compareValues(questionValue, expectedValue, '<=');
      break;

    default:
      // Unknown operator - treat as failed
      console.warn(`Unknown enableWhen operator: ${condition.operator}`);
      result = false;
  }

  return {
    questionId: condition.question,
    operator: condition.operator,
    expectedValue,
    actualValue: questionValue,
    result,
  };
}

/**
 * Extract the expected value from an enableWhen condition
 */
function getExpectedValue(condition: QuestionnaireItemEnableWhen): any {
  if (condition.answerBoolean !== undefined) {
    return condition.answerBoolean;
  }
  if (condition.answerInteger !== undefined) {
    return condition.answerInteger;
  }
  if (condition.answerDecimal !== undefined) {
    return condition.answerDecimal;
  }
  if (condition.answerDate !== undefined) {
    return condition.answerDate;
  }
  if (condition.answerDateTime !== undefined) {
    return condition.answerDateTime;
  }
  if (condition.answerTime !== undefined) {
    return condition.answerTime;
  }
  if (condition.answerString !== undefined) {
    return condition.answerString;
  }
  if (condition.answerCoding !== undefined) {
    return condition.answerCoding;
  }
  if (condition.answerQuantity !== undefined) {
    return condition.answerQuantity.value;
  }
  if (condition.answerReference !== undefined) {
    return condition.answerReference.reference;
  }
  return undefined;
}

/**
 * Compare two values using the specified operator
 */
function compareValues(actual: any, expected: any, operator: string): boolean {
  // Handle Coding comparison
  if (expected && typeof expected === 'object' && 'code' in expected) {
    return compareCoding(actual, expected as Coding, operator);
  }

  // Handle null/undefined
  if (actual === undefined || actual === null) {
    if (operator === '=') {
      return expected === undefined || expected === null || expected === '';
    }
    if (operator === '!=') {
      return expected !== undefined && expected !== null && expected !== '';
    }
    return false;
  }

  // Handle boolean
  if (typeof expected === 'boolean') {
    const actualBool = Boolean(actual);
    if (operator === '=') {return actualBool === expected;}
    if (operator === '!=') {return actualBool !== expected;}
    return false;
  }

  // Handle numeric comparison
  if (typeof expected === 'number') {
    const actualNum = Number(actual);
    if (isNaN(actualNum)) {return false;}

    switch (operator) {
      case '=': return actualNum === expected;
      case '!=': return actualNum !== expected;
      case '>': return actualNum > expected;
      case '<': return actualNum < expected;
      case '>=': return actualNum >= expected;
      case '<=': return actualNum <= expected;
      default: return false;
    }
  }

  // Handle date comparison
  if (isDateString(expected) || isDateString(actual)) {
    return compareDates(actual, expected, operator);
  }

  // Handle string comparison
  const actualStr = String(actual);
  const expectedStr = String(expected);

  switch (operator) {
    case '=': return actualStr === expectedStr;
    case '!=': return actualStr !== expectedStr;
    case '>': return actualStr > expectedStr;
    case '<': return actualStr < expectedStr;
    case '>=': return actualStr >= expectedStr;
    case '<=': return actualStr <= expectedStr;
    default: return false;
  }
}

/**
 * Compare Coding values
 */
function compareCoding(actual: any, expected: Coding, operator: string): boolean {
  if (!actual) {
    return operator === '!=' || operator === 'exists';
  }

  // Extract code from actual value
  let actualCode: string | undefined;
  if (typeof actual === 'string') {
    actualCode = actual;
  } else if (typeof actual === 'object') {
    actualCode = actual.code || actual.value;
  }

  const expectedCode = expected.code;

  if (operator === '=') {
    return actualCode === expectedCode;
  }
  if (operator === '!=') {
    return actualCode !== expectedCode;
  }

  return false;
}

/**
 * Check if a value looks like a date string
 */
function isDateString(value: any): boolean {
  if (typeof value !== 'string') {return false;}
  // Match ISO date formats: YYYY-MM-DD, YYYY-MM-DDTHH:MM:SS
  return /^\d{4}-\d{2}-\d{2}/.test(value);
}

/**
 * Compare date values
 */
function compareDates(actual: any, expected: any, operator: string): boolean {
  const actualDate = new Date(actual);
  const expectedDate = new Date(expected);

  if (isNaN(actualDate.getTime()) || isNaN(expectedDate.getTime())) {
    return false;
  }

  const actualTime = actualDate.getTime();
  const expectedTime = expectedDate.getTime();

  switch (operator) {
    case '=': return actualTime === expectedTime;
    case '!=': return actualTime !== expectedTime;
    case '>': return actualTime > expectedTime;
    case '<': return actualTime < expectedTime;
    case '>=': return actualTime >= expectedTime;
    case '<=': return actualTime <= expectedTime;
    default: return false;
  }
}

/**
 * Get all dependent field linkIds that this item depends on
 *
 * @param item - QuestionnaireItem to analyze
 * @returns Array of linkIds this item depends on
 */
export function getDependentFields(item: QuestionnaireItem): string[] {
  if (!item.enableWhen || item.enableWhen.length === 0) {
    return [];
  }

  return item.enableWhen.map((condition) => condition.question);
}

/**
 * Build a dependency map for all items in a questionnaire
 *
 * @param items - Array of QuestionnaireItems
 * @returns Map of linkId -> array of linkIds that depend on it
 */
export function buildDependencyMap(items: QuestionnaireItem[]): Map<string, string[]> {
  const dependencyMap = new Map<string, string[]>();

  function processItems(itemList: QuestionnaireItem[]): void {
    for (const item of itemList) {
      const dependencies = getDependentFields(item);
      for (const dep of dependencies) {
        const existing = dependencyMap.get(dep) || [];
        if (!existing.includes(item.linkId)) {
          existing.push(item.linkId);
        }
        dependencyMap.set(dep, existing);
      }

      // Process nested items
      if (item.item && item.item.length > 0) {
        processItems(item.item);
      }
    }
  }

  processItems(items);
  return dependencyMap;
}

/**
 * Evaluate all items and return visibility map
 *
 * @param items - Array of QuestionnaireItems
 * @param formValues - Current form values
 * @returns Map of linkId -> isVisible
 */
export function evaluateAllConditions(
  items: QuestionnaireItem[],
  formValues: Record<string, any>
): Map<string, boolean> {
  const visibilityMap = new Map<string, boolean>();

  function processItems(itemList: QuestionnaireItem[], depth = 0): void {
    for (const item of itemList) {
      const result = evaluateEnableWhen(item, formValues, depth);
      visibilityMap.set(item.linkId, result.isEnabled);

      // Process nested items
      if (item.item && item.item.length > 0) {
        processItems(item.item, depth + 1);
      }
    }
  }

  processItems(items);
  return visibilityMap;
}

/**
 * Get linkIds of all fields that should have their values cleared
 * (fields that are currently hidden due to conditional logic)
 *
 * @param items - Array of QuestionnaireItems
 * @param formValues - Current form values
 * @returns Array of linkIds that should be cleared
 */
export function getFieldsToClear(
  items: QuestionnaireItem[],
  formValues: Record<string, any>
): string[] {
  const visibilityMap = evaluateAllConditions(items, formValues);
  const fieldsToClear: string[] = [];

  function processItems(itemList: QuestionnaireItem[]): void {
    for (const item of itemList) {
      const isVisible = visibilityMap.get(item.linkId);
      const hasValue = formValues[item.linkId] !== undefined && formValues[item.linkId] !== null;

      if (!isVisible && hasValue) {
        fieldsToClear.push(item.linkId);
      }

      // Check nested items
      if (item.item && item.item.length > 0) {
        processItems(item.item);
      }
    }
  }

  processItems(items);
  return fieldsToClear;
}
