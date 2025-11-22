// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { MockClient } from '@medplum/mock';
import type { QuestionnaireResponse, Questionnaire, Bundle } from '@medplum/fhirtypes';
import {
  aggregateMetrics,
  calculateCompletionRate,
  getAverageCompletionTime,
  getSkippedFieldStats,
  generateDailyReport,
  exportToCSV,
  exportSummaryToCSV,
  createCompletionTimeExtension,
  createStartTimeExtension,
  getDateRangeForPeriod,
  COMPLETION_TIME_EXTENSION_URL,
  FORM_START_TIME_EXTENSION_URL,
} from './formAnalyticsService';

describe('formAnalyticsService', () => {
  let medplum: MockClient;

  beforeEach(() => {
    medplum = new MockClient();
  });

  describe('calculateCompletionRate', () => {
    it('should return 0 for empty responses array', () => {
      const result = calculateCompletionRate([]);
      expect(result).toBe(0);
    });

    it('should calculate correct completion rate', () => {
      const responses: QuestionnaireResponse[] = [
        { resourceType: 'QuestionnaireResponse', status: 'completed' },
        { resourceType: 'QuestionnaireResponse', status: 'completed' },
        { resourceType: 'QuestionnaireResponse', status: 'in-progress' },
        { resourceType: 'QuestionnaireResponse', status: 'in-progress' },
      ];

      const result = calculateCompletionRate(responses);
      expect(result).toBe(50);
    });

    it('should return 100 when all forms are completed', () => {
      const responses: QuestionnaireResponse[] = [
        { resourceType: 'QuestionnaireResponse', status: 'completed' },
        { resourceType: 'QuestionnaireResponse', status: 'completed' },
        { resourceType: 'QuestionnaireResponse', status: 'completed' },
      ];

      const result = calculateCompletionRate(responses);
      expect(result).toBe(100);
    });

    it('should return 0 when no forms are completed', () => {
      const responses: QuestionnaireResponse[] = [
        { resourceType: 'QuestionnaireResponse', status: 'in-progress' },
        { resourceType: 'QuestionnaireResponse', status: 'in-progress' },
      ];

      const result = calculateCompletionRate(responses);
      expect(result).toBe(0);
    });

    it('should round to one decimal place', () => {
      const responses: QuestionnaireResponse[] = [
        { resourceType: 'QuestionnaireResponse', status: 'completed' },
        { resourceType: 'QuestionnaireResponse', status: 'in-progress' },
        { resourceType: 'QuestionnaireResponse', status: 'in-progress' },
      ];

      const result = calculateCompletionRate(responses);
      expect(result).toBe(33.3);
    });
  });

  describe('getAverageCompletionTime', () => {
    it('should return 0 for empty responses array', () => {
      const result = getAverageCompletionTime([]);
      expect(result).toBe(0);
    });

    it('should return 0 when no completed responses have completion time', () => {
      const responses: QuestionnaireResponse[] = [
        { resourceType: 'QuestionnaireResponse', status: 'completed' },
        { resourceType: 'QuestionnaireResponse', status: 'in-progress' },
      ];

      const result = getAverageCompletionTime(responses);
      expect(result).toBe(0);
    });

    it('should calculate average completion time from extensions', () => {
      const responses: QuestionnaireResponse[] = [
        {
          resourceType: 'QuestionnaireResponse',
          status: 'completed',
          meta: {
            extension: [
              {
                url: COMPLETION_TIME_EXTENSION_URL,
                valueInteger: 60000, // 1 minute
              },
            ],
          },
        },
        {
          resourceType: 'QuestionnaireResponse',
          status: 'completed',
          meta: {
            extension: [
              {
                url: COMPLETION_TIME_EXTENSION_URL,
                valueInteger: 120000, // 2 minutes
              },
            ],
          },
        },
      ];

      const result = getAverageCompletionTime(responses);
      expect(result).toBe(90000); // Average of 60000 and 120000
    });

    it('should ignore in-progress responses', () => {
      const responses: QuestionnaireResponse[] = [
        {
          resourceType: 'QuestionnaireResponse',
          status: 'completed',
          meta: {
            extension: [
              {
                url: COMPLETION_TIME_EXTENSION_URL,
                valueInteger: 60000,
              },
            ],
          },
        },
        {
          resourceType: 'QuestionnaireResponse',
          status: 'in-progress',
          meta: {
            extension: [
              {
                url: COMPLETION_TIME_EXTENSION_URL,
                valueInteger: 999999, // Should be ignored
              },
            ],
          },
        },
      ];

      const result = getAverageCompletionTime(responses);
      expect(result).toBe(60000);
    });
  });

  describe('createCompletionTimeExtension', () => {
    it('should create extension with correct URL and completion time', () => {
      const startTime = Date.now() - 120000; // 2 minutes ago
      const result = createCompletionTimeExtension(startTime);

      expect(result.url).toBe(COMPLETION_TIME_EXTENSION_URL);
      expect(result.valueInteger).toBeGreaterThanOrEqual(120000);
      expect(result.valueInteger).toBeLessThan(130000); // Allow some tolerance
    });
  });

  describe('createStartTimeExtension', () => {
    it('should create extension with correct URL and current timestamp', () => {
      const beforeCreate = new Date();
      const result = createStartTimeExtension();
      const afterCreate = new Date();

      expect(result.url).toBe(FORM_START_TIME_EXTENSION_URL);
      // Check that the timestamp is a valid ISO string within the expected range
      const resultDate = new Date(result.valueInstant);
      expect(resultDate.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime());
      expect(resultDate.getTime()).toBeLessThanOrEqual(afterCreate.getTime());
    });
  });

  describe('getDateRangeForPeriod', () => {
    it('should return 7 days range for 7d period', () => {
      const result = getDateRangeForPeriod('7d');

      const fromDate = new Date(result.dateFrom);
      const toDate = new Date(result.dateTo);
      const diffDays = Math.round((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24));

      expect(diffDays).toBe(7);
    });

    it('should return 30 days range for 30d period', () => {
      const result = getDateRangeForPeriod('30d');

      const fromDate = new Date(result.dateFrom);
      const toDate = new Date(result.dateTo);
      const diffDays = Math.round((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24));

      expect(diffDays).toBe(30);
    });

    it('should return 90 days range for 90d period', () => {
      const result = getDateRangeForPeriod('90d');

      const fromDate = new Date(result.dateFrom);
      const toDate = new Date(result.dateTo);
      const diffDays = Math.round((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24));

      expect(diffDays).toBe(90);
    });

    it('should return custom range when custom period with dates provided', () => {
      const result = getDateRangeForPeriod('custom', '2025-01-01', '2025-01-15');

      expect(result.dateFrom).toBe('2025-01-01');
      expect(result.dateTo).toBe('2025-01-15');
    });

    it('should default to 30 days when custom period without dates', () => {
      const result = getDateRangeForPeriod('custom');

      const fromDate = new Date(result.dateFrom);
      const toDate = new Date(result.dateTo);
      const diffDays = Math.round((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24));

      expect(diffDays).toBe(30);
    });
  });

  describe('exportToCSV', () => {
    it('should export analytics data to CSV format', () => {
      const analytics = {
        totalForms: 100,
        completedForms: 80,
        inProgressForms: 15,
        draftForms: 5,
        completionRate: 80,
        averageCompletionTimeMs: 300000,
        formsByType: [
          { type: 'Consent Form', typeId: 'consent-form', count: 50 },
          { type: 'Medical History', typeId: 'medical-history', count: 50 },
        ],
        completionTrend: [
          { date: '2025-11-01', completed: 10, started: 12, completionRate: 83.3 },
          { date: '2025-11-02', completed: 15, started: 18, completionRate: 83.3 },
        ],
        skippedFields: [],
      };

      const result = exportToCSV(analytics);

      expect(result).toContain('Date,Form Type,Total,Completed,Completion Rate,Avg Time (min)');
      expect(result).toContain('2025-11-01');
      expect(result).toContain('Consent Form');
      expect(result).toContain('Medical History');
    });

    it('should filter by form type when specified', () => {
      const analytics = {
        totalForms: 100,
        completedForms: 80,
        inProgressForms: 15,
        draftForms: 5,
        completionRate: 80,
        averageCompletionTimeMs: 300000,
        formsByType: [
          { type: 'Consent Form', typeId: 'consent-form', count: 50 },
          { type: 'Medical History', typeId: 'medical-history', count: 50 },
        ],
        completionTrend: [
          { date: '2025-11-01', completed: 10, started: 12, completionRate: 83.3 },
        ],
        skippedFields: [],
      };

      const result = exportToCSV(analytics, 'Consent Form');

      expect(result).toContain('Consent Form');
      expect(result).not.toContain('Medical History');
    });
  });

  describe('exportSummaryToCSV', () => {
    it('should export summary analytics to CSV format', () => {
      const analytics = {
        totalForms: 100,
        completedForms: 80,
        inProgressForms: 15,
        draftForms: 5,
        completionRate: 80,
        averageCompletionTimeMs: 300000,
        formsByType: [
          { type: 'Consent Form', typeId: 'consent-form', count: 50 },
        ],
        completionTrend: [],
        skippedFields: [
          { fieldId: 'field-1', fieldLabel: 'Optional Field', skipCount: 25, skipRate: 25 },
        ],
      };

      const result = exportSummaryToCSV(analytics);

      expect(result).toContain('Metric,Value');
      expect(result).toContain('Total Forms,100');
      expect(result).toContain('Completed Forms,80');
      expect(result).toContain('Completion Rate,80%');
      expect(result).toContain('Form Type,Count');
      expect(result).toContain('"Consent Form",50');
      expect(result).toContain('Skipped Field,Skip Count,Skip Rate');
      expect(result).toContain('"Optional Field",25,25%');
    });
  });

  describe('aggregateMetrics', () => {
    beforeEach(async () => {
      // Create test questionnaire
      await medplum.createResource({
        resourceType: 'Questionnaire',
        id: 'test-questionnaire',
        status: 'active',
        title: 'Test Form',
        item: [
          {
            linkId: 'q1',
            type: 'string',
            text: 'Question 1',
            required: true,
          },
          {
            linkId: 'q2',
            type: 'string',
            text: 'Question 2',
          },
        ],
      });

      // Create test responses
      await medplum.createResource({
        resourceType: 'QuestionnaireResponse',
        status: 'completed',
        questionnaire: 'Questionnaire/test-questionnaire',
        authored: '2025-11-01T10:00:00Z',
        meta: {
          extension: [
            {
              url: COMPLETION_TIME_EXTENSION_URL,
              valueInteger: 120000, // 2 minutes
            },
          ],
        },
        item: [
          {
            linkId: 'q1',
            text: 'Question 1',
            answer: [{ valueString: 'Answer 1' }],
          },
        ],
      });

      await medplum.createResource({
        resourceType: 'QuestionnaireResponse',
        status: 'in-progress',
        questionnaire: 'Questionnaire/test-questionnaire',
        authored: '2025-11-02T10:00:00Z',
        item: [],
      });
    });

    it('should aggregate metrics correctly', async () => {
      const result = await aggregateMetrics(medplum, {
        dateFrom: '2025-11-01',
        dateTo: '2025-11-03',
      });

      expect(result.totalForms).toBe(2);
      expect(result.completedForms).toBe(1);
      expect(result.inProgressForms).toBe(1);
      expect(result.completionRate).toBe(50);
    });

    it('should filter by questionnaire ID', async () => {
      const result = await aggregateMetrics(medplum, {
        questionnaireId: 'test-questionnaire',
      });

      expect(result.totalForms).toBe(2);
    });

    it('should return empty results for no matching responses', async () => {
      const result = await aggregateMetrics(medplum, {
        questionnaireId: 'non-existent',
      });

      expect(result.totalForms).toBe(0);
      expect(result.completionRate).toBe(0);
    });
  });

  describe('getSkippedFieldStats', () => {
    it('should return empty array for empty responses', async () => {
      const result = await getSkippedFieldStats(medplum, []);
      expect(result).toEqual([]);
    });

    it('should identify skipped fields', async () => {
      // Create questionnaire with required fields
      await medplum.createResource({
        resourceType: 'Questionnaire',
        id: 'skip-test-questionnaire',
        status: 'active',
        title: 'Skip Test Form',
        item: [
          {
            linkId: 'required-field',
            type: 'string',
            text: 'Required Field',
            required: true,
          },
          {
            linkId: 'optional-field',
            type: 'string',
            text: 'Optional Field',
          },
        ],
      });

      const responses: QuestionnaireResponse[] = [
        {
          resourceType: 'QuestionnaireResponse',
          status: 'completed',
          questionnaire: 'Questionnaire/skip-test-questionnaire',
          item: [
            {
              linkId: 'required-field',
              answer: [{ valueString: 'Filled' }],
            },
            // optional-field is skipped
          ],
        },
      ];

      const result = await getSkippedFieldStats(medplum, responses);

      const optionalFieldStat = result.find((s) => s.fieldId === 'optional-field');
      expect(optionalFieldStat).toBeDefined();
      expect(optionalFieldStat?.skipCount).toBe(1);
    });
  });

  describe('generateDailyReport', () => {
    beforeEach(async () => {
      // Create test data
      await medplum.createResource({
        resourceType: 'Questionnaire',
        id: 'daily-test-questionnaire',
        status: 'active',
        title: 'Daily Test Form',
        item: [
          {
            linkId: 'q1',
            type: 'string',
            text: 'Question 1',
          },
        ],
      });

      await medplum.createResource({
        resourceType: 'QuestionnaireResponse',
        status: 'completed',
        questionnaire: 'Questionnaire/daily-test-questionnaire',
        authored: '2025-11-15T10:00:00Z',
        meta: {
          extension: [
            {
              url: COMPLETION_TIME_EXTENSION_URL,
              valueInteger: 180000, // 3 minutes
            },
          ],
        },
        item: [
          {
            linkId: 'q1',
            answer: [{ valueString: 'Test answer' }],
          },
        ],
      });
    });

    it('should generate daily report with correct date', async () => {
      const result = await generateDailyReport(medplum, '2025-11-15');

      expect(result.date).toBe('2025-11-15');
      expect(result.totalSubmissions).toBeGreaterThanOrEqual(0);
    });

    it('should include form breakdown by type', async () => {
      const result = await generateDailyReport(medplum, '2025-11-15');

      expect(Array.isArray(result.formsByType)).toBe(true);
    });

    it('should include top skipped fields', async () => {
      const result = await generateDailyReport(medplum, '2025-11-15');

      expect(Array.isArray(result.topSkippedFields)).toBe(true);
      expect(result.topSkippedFields.length).toBeLessThanOrEqual(10);
    });
  });
});
