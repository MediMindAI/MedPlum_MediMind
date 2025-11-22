// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import type { QuestionnaireItem, QuestionnaireItemEnableWhen } from '@medplum/fhirtypes';
import {
  evaluateEnableWhen,
  evaluateSingleCondition,
  getDependentFields,
  buildDependencyMap,
  evaluateAllConditions,
  getFieldsToClear,
} from './conditionEvaluator';

describe('conditionEvaluator', () => {
  describe('evaluateSingleCondition', () => {
    describe('equals operator (=)', () => {
      it('should return true when string values are equal', () => {
        const condition: QuestionnaireItemEnableWhen = {
          question: 'field1',
          operator: '=',
          answerString: 'yes',
        };
        const formValues = { field1: 'yes' };

        const result = evaluateSingleCondition(condition, formValues);

        expect(result.result).toBe(true);
        expect(result.questionId).toBe('field1');
        expect(result.operator).toBe('=');
      });

      it('should return false when string values are not equal', () => {
        const condition: QuestionnaireItemEnableWhen = {
          question: 'field1',
          operator: '=',
          answerString: 'yes',
        };
        const formValues = { field1: 'no' };

        const result = evaluateSingleCondition(condition, formValues);

        expect(result.result).toBe(false);
      });

      it('should return true when boolean values are equal', () => {
        const condition: QuestionnaireItemEnableWhen = {
          question: 'isChecked',
          operator: '=',
          answerBoolean: true,
        };
        const formValues = { isChecked: true };

        const result = evaluateSingleCondition(condition, formValues);

        expect(result.result).toBe(true);
      });

      it('should return true when integer values are equal', () => {
        const condition: QuestionnaireItemEnableWhen = {
          question: 'count',
          operator: '=',
          answerInteger: 5,
        };
        const formValues = { count: 5 };

        const result = evaluateSingleCondition(condition, formValues);

        expect(result.result).toBe(true);
      });

      it('should return true when decimal values are equal', () => {
        const condition: QuestionnaireItemEnableWhen = {
          question: 'amount',
          operator: '=',
          answerDecimal: 10.5,
        };
        const formValues = { amount: 10.5 };

        const result = evaluateSingleCondition(condition, formValues);

        expect(result.result).toBe(true);
      });

      it('should handle Coding comparison', () => {
        const condition: QuestionnaireItemEnableWhen = {
          question: 'status',
          operator: '=',
          answerCoding: { code: 'active', display: 'Active' },
        };
        const formValues = { status: 'active' };

        const result = evaluateSingleCondition(condition, formValues);

        expect(result.result).toBe(true);
      });
    });

    describe('not equals operator (!=)', () => {
      it('should return true when values are not equal', () => {
        const condition: QuestionnaireItemEnableWhen = {
          question: 'field1',
          operator: '!=',
          answerString: 'yes',
        };
        const formValues = { field1: 'no' };

        const result = evaluateSingleCondition(condition, formValues);

        expect(result.result).toBe(true);
      });

      it('should return false when values are equal', () => {
        const condition: QuestionnaireItemEnableWhen = {
          question: 'field1',
          operator: '!=',
          answerString: 'yes',
        };
        const formValues = { field1: 'yes' };

        const result = evaluateSingleCondition(condition, formValues);

        expect(result.result).toBe(false);
      });
    });

    describe('comparison operators (>, <, >=, <=)', () => {
      it('should evaluate greater than correctly', () => {
        const condition: QuestionnaireItemEnableWhen = {
          question: 'age',
          operator: '>',
          answerInteger: 18,
        };

        expect(evaluateSingleCondition(condition, { age: 21 }).result).toBe(true);
        expect(evaluateSingleCondition(condition, { age: 18 }).result).toBe(false);
        expect(evaluateSingleCondition(condition, { age: 15 }).result).toBe(false);
      });

      it('should evaluate less than correctly', () => {
        const condition: QuestionnaireItemEnableWhen = {
          question: 'age',
          operator: '<',
          answerInteger: 18,
        };

        expect(evaluateSingleCondition(condition, { age: 15 }).result).toBe(true);
        expect(evaluateSingleCondition(condition, { age: 18 }).result).toBe(false);
        expect(evaluateSingleCondition(condition, { age: 21 }).result).toBe(false);
      });

      it('should evaluate greater than or equal correctly', () => {
        const condition: QuestionnaireItemEnableWhen = {
          question: 'age',
          operator: '>=',
          answerInteger: 18,
        };

        expect(evaluateSingleCondition(condition, { age: 21 }).result).toBe(true);
        expect(evaluateSingleCondition(condition, { age: 18 }).result).toBe(true);
        expect(evaluateSingleCondition(condition, { age: 15 }).result).toBe(false);
      });

      it('should evaluate less than or equal correctly', () => {
        const condition: QuestionnaireItemEnableWhen = {
          question: 'age',
          operator: '<=',
          answerInteger: 18,
        };

        expect(evaluateSingleCondition(condition, { age: 15 }).result).toBe(true);
        expect(evaluateSingleCondition(condition, { age: 18 }).result).toBe(true);
        expect(evaluateSingleCondition(condition, { age: 21 }).result).toBe(false);
      });

      it('should compare decimal values', () => {
        const condition: QuestionnaireItemEnableWhen = {
          question: 'price',
          operator: '>',
          answerDecimal: 99.99,
        };

        expect(evaluateSingleCondition(condition, { price: 150.5 }).result).toBe(true);
        expect(evaluateSingleCondition(condition, { price: 50.0 }).result).toBe(false);
      });
    });

    describe('exists operator', () => {
      it('should return true when value exists', () => {
        const condition: QuestionnaireItemEnableWhen = {
          question: 'field1',
          operator: 'exists',
          answerBoolean: true,
        };
        const formValues = { field1: 'some value' };

        const result = evaluateSingleCondition(condition, formValues);

        expect(result.result).toBe(true);
      });

      it('should return false when value does not exist', () => {
        const condition: QuestionnaireItemEnableWhen = {
          question: 'field1',
          operator: 'exists',
          answerBoolean: true,
        };
        const formValues = { field2: 'other' };

        const result = evaluateSingleCondition(condition, formValues);

        expect(result.result).toBe(false);
      });

      it('should return inverted result when answerBoolean is false', () => {
        const condition: QuestionnaireItemEnableWhen = {
          question: 'field1',
          operator: 'exists',
          answerBoolean: false,
        };

        // Value exists, but answerBoolean=false means we want it NOT to exist
        expect(evaluateSingleCondition(condition, { field1: 'value' }).result).toBe(false);
        expect(evaluateSingleCondition(condition, {}).result).toBe(true);
      });
    });

    describe('date comparison', () => {
      it('should compare dates correctly', () => {
        const condition: QuestionnaireItemEnableWhen = {
          question: 'appointmentDate',
          operator: '>',
          answerDate: '2024-01-01',
        };

        expect(evaluateSingleCondition(condition, { appointmentDate: '2024-06-15' }).result).toBe(true);
        expect(evaluateSingleCondition(condition, { appointmentDate: '2023-06-15' }).result).toBe(false);
      });
    });

    describe('edge cases', () => {
      it('should handle null values', () => {
        const condition: QuestionnaireItemEnableWhen = {
          question: 'field1',
          operator: '=',
          answerString: '',
        };
        const formValues = { field1: null };

        const result = evaluateSingleCondition(condition, formValues);

        expect(result.result).toBe(true);
      });

      it('should handle undefined values', () => {
        const condition: QuestionnaireItemEnableWhen = {
          question: 'field1',
          operator: '=',
          answerString: '',
        };
        const formValues = {};

        const result = evaluateSingleCondition(condition, formValues);

        expect(result.result).toBe(true);
      });
    });
  });

  describe('evaluateEnableWhen', () => {
    it('should return enabled=true when no conditions', () => {
      const item: QuestionnaireItem = {
        linkId: 'field1',
        type: 'string',
      };
      const formValues = {};

      const result = evaluateEnableWhen(item, formValues);

      expect(result.isEnabled).toBe(true);
      expect(result.evaluatedConditions).toHaveLength(0);
    });

    it('should evaluate single condition', () => {
      const item: QuestionnaireItem = {
        linkId: 'conditionalField',
        type: 'string',
        enableWhen: [{ question: 'showField', operator: '=', answerBoolean: true }],
      };
      const formValues = { showField: true };

      const result = evaluateEnableWhen(item, formValues);

      expect(result.isEnabled).toBe(true);
    });

    describe('enableBehavior: all (AND)', () => {
      it('should return true when all conditions are met', () => {
        const item: QuestionnaireItem = {
          linkId: 'conditionalField',
          type: 'string',
          enableWhen: [
            { question: 'field1', operator: '=', answerBoolean: true },
            { question: 'field2', operator: '=', answerString: 'yes' },
          ],
          enableBehavior: 'all',
        };
        const formValues = { field1: true, field2: 'yes' };

        const result = evaluateEnableWhen(item, formValues);

        expect(result.isEnabled).toBe(true);
      });

      it('should return false when any condition is not met', () => {
        const item: QuestionnaireItem = {
          linkId: 'conditionalField',
          type: 'string',
          enableWhen: [
            { question: 'field1', operator: '=', answerBoolean: true },
            { question: 'field2', operator: '=', answerString: 'yes' },
          ],
          enableBehavior: 'all',
        };
        const formValues = { field1: true, field2: 'no' };

        const result = evaluateEnableWhen(item, formValues);

        expect(result.isEnabled).toBe(false);
      });
    });

    describe('enableBehavior: any (OR)', () => {
      it('should return true when any condition is met', () => {
        const item: QuestionnaireItem = {
          linkId: 'conditionalField',
          type: 'string',
          enableWhen: [
            { question: 'field1', operator: '=', answerBoolean: true },
            { question: 'field2', operator: '=', answerString: 'yes' },
          ],
          enableBehavior: 'any',
        };
        const formValues = { field1: false, field2: 'yes' };

        const result = evaluateEnableWhen(item, formValues);

        expect(result.isEnabled).toBe(true);
      });

      it('should return false when no conditions are met', () => {
        const item: QuestionnaireItem = {
          linkId: 'conditionalField',
          type: 'string',
          enableWhen: [
            { question: 'field1', operator: '=', answerBoolean: true },
            { question: 'field2', operator: '=', answerString: 'yes' },
          ],
          enableBehavior: 'any',
        };
        const formValues = { field1: false, field2: 'no' };

        const result = evaluateEnableWhen(item, formValues);

        expect(result.isEnabled).toBe(false);
      });
    });

    it('should handle nested depth limit', () => {
      const item: QuestionnaireItem = {
        linkId: 'deepField',
        type: 'string',
        enableWhen: [{ question: 'trigger', operator: '=', answerBoolean: true }],
      };
      const formValues = { trigger: false };

      // At max depth, should return enabled=true
      const result = evaluateEnableWhen(item, formValues, 3);

      expect(result.isEnabled).toBe(true);
    });
  });

  describe('getDependentFields', () => {
    it('should return empty array when no enableWhen', () => {
      const item: QuestionnaireItem = {
        linkId: 'field1',
        type: 'string',
      };

      const result = getDependentFields(item);

      expect(result).toHaveLength(0);
    });

    it('should return question linkIds from enableWhen', () => {
      const item: QuestionnaireItem = {
        linkId: 'field1',
        type: 'string',
        enableWhen: [
          { question: 'trigger1', operator: '=', answerBoolean: true },
          { question: 'trigger2', operator: '=', answerString: 'yes' },
        ],
      };

      const result = getDependentFields(item);

      expect(result).toEqual(['trigger1', 'trigger2']);
    });
  });

  describe('buildDependencyMap', () => {
    it('should build correct dependency map', () => {
      const items: QuestionnaireItem[] = [
        { linkId: 'trigger', type: 'boolean' },
        {
          linkId: 'dependent1',
          type: 'string',
          enableWhen: [{ question: 'trigger', operator: '=', answerBoolean: true }],
        },
        {
          linkId: 'dependent2',
          type: 'string',
          enableWhen: [{ question: 'trigger', operator: '=', answerBoolean: true }],
        },
      ];

      const result = buildDependencyMap(items);

      expect(result.get('trigger')).toEqual(['dependent1', 'dependent2']);
    });

    it('should handle nested items', () => {
      const items: QuestionnaireItem[] = [
        { linkId: 'trigger', type: 'boolean' },
        {
          linkId: 'group1',
          type: 'group',
          item: [
            {
              linkId: 'nestedDependent',
              type: 'string',
              enableWhen: [{ question: 'trigger', operator: '=', answerBoolean: true }],
            },
          ],
        },
      ];

      const result = buildDependencyMap(items);

      expect(result.get('trigger')).toEqual(['nestedDependent']);
    });
  });

  describe('evaluateAllConditions', () => {
    it('should return visibility map for all items', () => {
      const items: QuestionnaireItem[] = [
        { linkId: 'trigger', type: 'boolean' },
        {
          linkId: 'conditional',
          type: 'string',
          enableWhen: [{ question: 'trigger', operator: '=', answerBoolean: true }],
        },
      ];
      const formValues = { trigger: true };

      const result = evaluateAllConditions(items, formValues);

      expect(result.get('trigger')).toBe(true);
      expect(result.get('conditional')).toBe(true);
    });

    it('should mark fields as hidden when conditions not met', () => {
      const items: QuestionnaireItem[] = [
        { linkId: 'trigger', type: 'boolean' },
        {
          linkId: 'conditional',
          type: 'string',
          enableWhen: [{ question: 'trigger', operator: '=', answerBoolean: true }],
        },
      ];
      const formValues = { trigger: false };

      const result = evaluateAllConditions(items, formValues);

      expect(result.get('conditional')).toBe(false);
    });
  });

  describe('getFieldsToClear', () => {
    it('should return hidden fields with values', () => {
      const items: QuestionnaireItem[] = [
        { linkId: 'trigger', type: 'boolean' },
        {
          linkId: 'conditional',
          type: 'string',
          enableWhen: [{ question: 'trigger', operator: '=', answerBoolean: true }],
        },
      ];
      const formValues = { trigger: false, conditional: 'some value' };

      const result = getFieldsToClear(items, formValues);

      expect(result).toContain('conditional');
    });

    it('should not return hidden fields without values', () => {
      const items: QuestionnaireItem[] = [
        { linkId: 'trigger', type: 'boolean' },
        {
          linkId: 'conditional',
          type: 'string',
          enableWhen: [{ question: 'trigger', operator: '=', answerBoolean: true }],
        },
      ];
      const formValues = { trigger: false };

      const result = getFieldsToClear(items, formValues);

      expect(result).not.toContain('conditional');
    });

    it('should not return visible fields', () => {
      const items: QuestionnaireItem[] = [
        { linkId: 'trigger', type: 'boolean' },
        {
          linkId: 'conditional',
          type: 'string',
          enableWhen: [{ question: 'trigger', operator: '=', answerBoolean: true }],
        },
      ];
      const formValues = { trigger: true, conditional: 'some value' };

      const result = getFieldsToClear(items, formValues);

      expect(result).not.toContain('conditional');
    });
  });
});
