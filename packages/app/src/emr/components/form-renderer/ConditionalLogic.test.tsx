// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { render, screen, waitFor } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import type { QuestionnaireItem } from '@medplum/fhirtypes';
import { ConditionalLogic, useConditionalLogic } from './ConditionalLogic';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <MantineProvider>{children}</MantineProvider>
);

describe('ConditionalLogic', () => {
  describe('rendering', () => {
    it('should render children when no conditions exist', () => {
      const item: QuestionnaireItem = {
        linkId: 'field1',
        type: 'string',
      };

      render(
        <ConditionalLogic item={item} formValues={{}}>
          <div data-testid="child">Child Content</div>
        </ConditionalLogic>,
        { wrapper }
      );

      expect(screen.getByTestId('child')).toBeInTheDocument();
    });

    it('should render children when condition is met', async () => {
      const item: QuestionnaireItem = {
        linkId: 'conditionalField',
        type: 'string',
        enableWhen: [{ question: 'showField', operator: '=', answerBoolean: true }],
      };

      render(
        <ConditionalLogic item={item} formValues={{ showField: true }}>
          <div data-testid="child">Conditional Content</div>
        </ConditionalLogic>,
        { wrapper }
      );

      await waitFor(() => {
        expect(screen.getByTestId('child')).toBeInTheDocument();
      });
    });

    it('should hide children when condition is not met', async () => {
      const item: QuestionnaireItem = {
        linkId: 'conditionalField',
        type: 'string',
        enableWhen: [{ question: 'showField', operator: '=', answerBoolean: true }],
      };

      render(
        <ConditionalLogic item={item} formValues={{ showField: false }}>
          <div data-testid="child">Conditional Content</div>
        </ConditionalLogic>,
        { wrapper }
      );

      // Content should be hidden (inside collapsed container)
      const conditionalWrapper = screen.queryByTestId('conditional-conditionalField');
      // The Collapse component hides content but keeps it in DOM
      // Check that the data-visible attribute is false
      expect(conditionalWrapper).toHaveAttribute('data-visible', 'false');
    });
  });

  describe('AND logic (enableBehavior: all)', () => {
    it('should show content when ALL conditions are met', async () => {
      const item: QuestionnaireItem = {
        linkId: 'conditionalField',
        type: 'string',
        enableWhen: [
          { question: 'condition1', operator: '=', answerBoolean: true },
          { question: 'condition2', operator: '=', answerString: 'yes' },
        ],
        enableBehavior: 'all',
      };

      render(
        <ConditionalLogic item={item} formValues={{ condition1: true, condition2: 'yes' }}>
          <div data-testid="child">All conditions met</div>
        </ConditionalLogic>,
        { wrapper }
      );

      await waitFor(() => {
        const conditionalWrapper = screen.getByTestId('conditional-conditionalField');
        expect(conditionalWrapper).toHaveAttribute('data-visible', 'true');
      });
    });

    it('should hide content when ANY condition is not met', async () => {
      const item: QuestionnaireItem = {
        linkId: 'conditionalField',
        type: 'string',
        enableWhen: [
          { question: 'condition1', operator: '=', answerBoolean: true },
          { question: 'condition2', operator: '=', answerString: 'yes' },
        ],
        enableBehavior: 'all',
      };

      render(
        <ConditionalLogic item={item} formValues={{ condition1: true, condition2: 'no' }}>
          <div data-testid="child">Content</div>
        </ConditionalLogic>,
        { wrapper }
      );

      await waitFor(() => {
        const conditionalWrapper = screen.getByTestId('conditional-conditionalField');
        expect(conditionalWrapper).toHaveAttribute('data-visible', 'false');
      });
    });
  });

  describe('OR logic (enableBehavior: any)', () => {
    it('should show content when ANY condition is met', async () => {
      const item: QuestionnaireItem = {
        linkId: 'conditionalField',
        type: 'string',
        enableWhen: [
          { question: 'condition1', operator: '=', answerBoolean: true },
          { question: 'condition2', operator: '=', answerString: 'yes' },
        ],
        enableBehavior: 'any',
      };

      render(
        <ConditionalLogic item={item} formValues={{ condition1: false, condition2: 'yes' }}>
          <div data-testid="child">Any condition met</div>
        </ConditionalLogic>,
        { wrapper }
      );

      await waitFor(() => {
        const conditionalWrapper = screen.getByTestId('conditional-conditionalField');
        expect(conditionalWrapper).toHaveAttribute('data-visible', 'true');
      });
    });

    it('should hide content when NO conditions are met', async () => {
      const item: QuestionnaireItem = {
        linkId: 'conditionalField',
        type: 'string',
        enableWhen: [
          { question: 'condition1', operator: '=', answerBoolean: true },
          { question: 'condition2', operator: '=', answerString: 'yes' },
        ],
        enableBehavior: 'any',
      };

      render(
        <ConditionalLogic item={item} formValues={{ condition1: false, condition2: 'no' }}>
          <div data-testid="child">Content</div>
        </ConditionalLogic>,
        { wrapper }
      );

      await waitFor(() => {
        const conditionalWrapper = screen.getByTestId('conditional-conditionalField');
        expect(conditionalWrapper).toHaveAttribute('data-visible', 'false');
      });
    });
  });

  describe('onVisibilityChange callback', () => {
    it('should not call onVisibilityChange on initial render', async () => {
      const onVisibilityChange = jest.fn();
      const item: QuestionnaireItem = {
        linkId: 'conditionalField',
        type: 'string',
        enableWhen: [{ question: 'showField', operator: '=', answerBoolean: true }],
      };

      render(
        <ConditionalLogic
          item={item}
          formValues={{ showField: true }}
          onVisibilityChange={onVisibilityChange}
        >
          <div>Content</div>
        </ConditionalLogic>,
        { wrapper }
      );

      // First render should not trigger callback (no previous state)
      expect(onVisibilityChange).not.toHaveBeenCalled();
    });

    it('should provide visibility change callback prop', async () => {
      const onVisibilityChange = jest.fn();
      const item: QuestionnaireItem = {
        linkId: 'conditionalField',
        type: 'string',
        enableWhen: [{ question: 'showField', operator: '=', answerBoolean: true }],
      };

      const { rerender } = render(
        <ConditionalLogic
          item={item}
          formValues={{ showField: true }}
          onVisibilityChange={onVisibilityChange}
        >
          <div>Content</div>
        </ConditionalLogic>,
        { wrapper }
      );

      // Verify component renders without error and accepts the callback
      const conditionalWrapper = screen.getByTestId('conditional-conditionalField');
      expect(conditionalWrapper).toHaveAttribute('data-visible', 'true');

      // Rerender with different value
      rerender(
        <MantineProvider>
          <ConditionalLogic
            item={item}
            formValues={{ showField: false }}
            onVisibilityChange={onVisibilityChange}
          >
            <div>Content</div>
          </ConditionalLogic>
        </MantineProvider>
      );

      await waitFor(() => {
        const updatedWrapper = screen.getByTestId('conditional-conditionalField');
        expect(updatedWrapper).toHaveAttribute('data-visible', 'false');
      });
    });
  });

  describe('different operators', () => {
    it('should handle numeric comparison', async () => {
      const item: QuestionnaireItem = {
        linkId: 'ageRestricted',
        type: 'string',
        enableWhen: [{ question: 'age', operator: '>=', answerInteger: 18 }],
      };

      render(
        <ConditionalLogic item={item} formValues={{ age: 21 }}>
          <div data-testid="adult-content">Adult Content</div>
        </ConditionalLogic>,
        { wrapper }
      );

      await waitFor(() => {
        const conditionalWrapper = screen.getByTestId('conditional-ageRestricted');
        expect(conditionalWrapper).toHaveAttribute('data-visible', 'true');
      });
    });

    it('should handle exists operator', async () => {
      const item: QuestionnaireItem = {
        linkId: 'showWhenHasValue',
        type: 'string',
        enableWhen: [{ question: 'optionalField', operator: 'exists', answerBoolean: true }],
      };

      render(
        <ConditionalLogic item={item} formValues={{ optionalField: 'some value' }}>
          <div data-testid="child">Has Value</div>
        </ConditionalLogic>,
        { wrapper }
      );

      await waitFor(() => {
        const conditionalWrapper = screen.getByTestId('conditional-showWhenHasValue');
        expect(conditionalWrapper).toHaveAttribute('data-visible', 'true');
      });
    });
  });
});

describe('useConditionalLogic hook', () => {
  it('should return true when no item provided', () => {
    const { result } = renderHook(() => useConditionalLogic(undefined, {}), { wrapper });

    expect(result.current).toBe(true);
  });

  it('should return true when no conditions', () => {
    const item: QuestionnaireItem = {
      linkId: 'field1',
      type: 'string',
    };

    const { result } = renderHook(() => useConditionalLogic(item, {}), { wrapper });

    expect(result.current).toBe(true);
  });

  it('should return true when condition is met', () => {
    const item: QuestionnaireItem = {
      linkId: 'conditionalField',
      type: 'string',
      enableWhen: [{ question: 'trigger', operator: '=', answerBoolean: true }],
    };

    const { result } = renderHook(
      () => useConditionalLogic(item, { trigger: true }),
      { wrapper }
    );

    expect(result.current).toBe(true);
  });

  it('should return false when condition is not met', () => {
    const item: QuestionnaireItem = {
      linkId: 'conditionalField',
      type: 'string',
      enableWhen: [{ question: 'trigger', operator: '=', answerBoolean: true }],
    };

    const { result } = renderHook(
      () => useConditionalLogic(item, { trigger: false }),
      { wrapper }
    );

    expect(result.current).toBe(false);
  });

  it('should update when form values change', () => {
    const item: QuestionnaireItem = {
      linkId: 'conditionalField',
      type: 'string',
      enableWhen: [{ question: 'trigger', operator: '=', answerBoolean: true }],
    };

    const { result, rerender } = renderHook(
      ({ formValues }) => useConditionalLogic(item, formValues),
      {
        wrapper,
        initialProps: { formValues: { trigger: false } },
      }
    );

    expect(result.current).toBe(false);

    rerender({ formValues: { trigger: true } });

    expect(result.current).toBe(true);
  });
});
