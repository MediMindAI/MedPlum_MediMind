// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { memo, useMemo, useEffect, useRef } from 'react';
import { Box, Collapse } from '@mantine/core';
import type { QuestionnaireItem } from '@medplum/fhirtypes';
import { evaluateEnableWhen } from '../../services/conditionEvaluator';

/**
 * Props for ConditionalLogic component
 */
export interface ConditionalLogicProps {
  /** The QuestionnaireItem with enableWhen conditions */
  item: QuestionnaireItem;
  /** Current form values keyed by linkId */
  formValues: Record<string, any>;
  /** Children to render when conditions are met */
  children: React.ReactNode;
  /** Called when visibility changes (for clearing hidden values) */
  onVisibilityChange?: (linkId: string, isVisible: boolean) => void;
  /** Current nesting depth (for nested condition tracking) */
  depth?: number;
  /** Animation duration in milliseconds */
  animationDuration?: number;
}

/**
 * ConditionalLogic Component
 *
 * Wrapper component that evaluates enableWhen conditions and shows/hides
 * children based on the evaluation result.
 *
 * Features:
 * - Evaluates FHIR enableWhen conditions
 * - Supports 'all' (AND) and 'any' (OR) logic via enableBehavior
 * - Handles nested conditions up to 3 levels deep
 * - Animated show/hide transitions
 * - Memoized for optimal re-rendering
 *
 * @example
 * ```tsx
 * const item = {
 *   linkId: 'conditionalField',
 *   enableWhen: [{ question: 'showExtra', operator: '=', answerBoolean: true }]
 * };
 *
 * <ConditionalLogic
 *   item={item}
 *   formValues={formValues}
 *   onVisibilityChange={handleVisibilityChange}
 * >
 *   <TextInput label="Extra Field" />
 * </ConditionalLogic>
 * ```
 */
function ConditionalLogicComponent({
  item,
  formValues,
  children,
  onVisibilityChange,
  depth = 0,
  animationDuration = 200,
}: ConditionalLogicProps): JSX.Element | null {
  const prevVisibleRef = useRef<boolean | null>(null);

  // Memoize the evaluation to prevent unnecessary recalculations
  const evaluationResult = useMemo(() => {
    return evaluateEnableWhen(item, formValues, depth);
  }, [item, formValues, depth]);

  const isVisible = evaluationResult.isEnabled;

  // Notify parent when visibility changes
  useEffect(() => {
    // Only notify if visibility actually changed
    if (prevVisibleRef.current !== null && prevVisibleRef.current !== isVisible) {
      onVisibilityChange?.(item.linkId, isVisible);
    }
    prevVisibleRef.current = isVisible;
  }, [isVisible, item.linkId, onVisibilityChange]);

  // If no conditions, always render children
  if (!item.enableWhen || item.enableWhen.length === 0) {
    return <>{children}</>;
  }

  return (
    <Collapse
      in={isVisible}
      transitionDuration={animationDuration}
      transitionTimingFunction="ease"
    >
      <Box data-testid={`conditional-${item.linkId}`} data-visible={isVisible}>
        {children}
      </Box>
    </Collapse>
  );
}

/**
 * Memoized ConditionalLogic component for performance optimization
 *
 * Only re-renders when:
 * - The item changes
 * - The relevant form values change (values for questions referenced in enableWhen)
 * - The children change
 */
export const ConditionalLogic = memo(
  ConditionalLogicComponent,
  (prevProps, nextProps) => {
    // Always re-render if item changed
    if (prevProps.item.linkId !== nextProps.item.linkId) {
      return false;
    }

    // Check if relevant form values changed
    const relevantQuestions = prevProps.item.enableWhen?.map((ew) => ew.question) || [];
    for (const question of relevantQuestions) {
      if (prevProps.formValues[question] !== nextProps.formValues[question]) {
        return false; // Values differ, need to re-render
      }
    }

    // Check if children changed (shallow comparison)
    if (prevProps.children !== nextProps.children) {
      return false;
    }

    // Check depth and animation duration
    if (prevProps.depth !== nextProps.depth) {
      return false;
    }
    if (prevProps.animationDuration !== nextProps.animationDuration) {
      return false;
    }

    // Props are equal, no re-render needed
    return true;
  }
);

ConditionalLogic.displayName = 'ConditionalLogic';

/**
 * Hook to use conditional logic evaluation
 *
 * @param item - QuestionnaireItem with enableWhen conditions
 * @param formValues - Current form values
 * @returns Whether the item should be visible
 */
export function useConditionalLogic(
  item: QuestionnaireItem | undefined,
  formValues: Record<string, any>
): boolean {
  return useMemo(() => {
    if (!item) {return true;}
    const result = evaluateEnableWhen(item, formValues);
    return result.isEnabled;
  }, [item, formValues]);
}

export default ConditionalLogic;
