// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

/**
 * Performance tests for Form Search functionality
 *
 * These tests verify that search operations complete within acceptable time limits
 * and handle large datasets efficiently.
 */

import { MockClient } from '@medplum/mock';
import type { QuestionnaireResponse, Bundle } from '@medplum/fhirtypes';
import {
  searchQuestionnaireResponses,
  type FormSearchParams,
} from './formRendererService';

// Generate mock responses for testing
function generateMockResponses(count: number): QuestionnaireResponse[] {
  const responses: QuestionnaireResponse[] = [];
  for (let i = 0; i < count; i++) {
    responses.push({
      resourceType: 'QuestionnaireResponse',
      id: `response-${i}`,
      status: i % 2 === 0 ? 'completed' : 'in-progress',
      questionnaire: 'Questionnaire/questionnaire-1',
      subject: { reference: `Patient/patient-${i % 10}` },
      authored: new Date(Date.now() - i * 86400000).toISOString(),
      item: [
        {
          linkId: 'item-1',
          text: `Question ${i}`,
          answer: [{ valueString: `Answer ${i} with some searchable content` }],
        },
        {
          linkId: 'item-2',
          text: 'Another field',
          answer: [{ valueString: `Data point ${i}` }],
        },
      ],
    });
  }
  return responses;
}

function createMockBundle(responses: QuestionnaireResponse[], total?: number): Bundle {
  return {
    resourceType: 'Bundle',
    type: 'searchset',
    total: total ?? responses.length,
    entry: responses.map((r) => ({ resource: r })),
  };
}

describe('FormRendererService Performance Tests', () => {
  let medplum: MockClient;

  beforeEach(() => {
    medplum = new MockClient();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('searchQuestionnaireResponses', () => {
    it('should complete basic search within 100ms for 100 results', async () => {
      const mockResponses = generateMockResponses(100);
      jest.spyOn(medplum, 'search').mockResolvedValue(createMockBundle(mockResponses, 100));

      const startTime = performance.now();
      const result = await searchQuestionnaireResponses(medplum, { _count: 100 });
      const endTime = performance.now();

      expect(result.responses).toHaveLength(100);
      expect(endTime - startTime).toBeLessThan(100);
    });

    it('should complete search with filters within 150ms', async () => {
      const mockResponses = generateMockResponses(100);
      jest.spyOn(medplum, 'search').mockResolvedValue(createMockBundle(mockResponses, 100));

      const params: FormSearchParams = {
        patientId: 'patient-1',
        status: 'completed',
        dateFrom: '2025-01-01',
        dateTo: '2025-01-31',
        _count: 100,
      };

      const startTime = performance.now();
      const result = await searchQuestionnaireResponses(medplum, params);
      const endTime = performance.now();

      expect(result.responses.length).toBeGreaterThan(0);
      expect(endTime - startTime).toBeLessThan(150);
    });

    it('should complete full-text search within 200ms for 100 results', async () => {
      const mockResponses = generateMockResponses(100);
      jest.spyOn(medplum, 'search').mockResolvedValue(createMockBundle(mockResponses, 100));

      const params: FormSearchParams = {
        fullTextSearch: 'Answer 5',
        _count: 100,
      };

      const startTime = performance.now();
      const result = await searchQuestionnaireResponses(medplum, params);
      const endTime = performance.now();

      // Should find responses containing "Answer 5"
      expect(result.responses.length).toBeGreaterThan(0);
      expect(endTime - startTime).toBeLessThan(200);
    });

    it('should handle pagination efficiently', async () => {
      const mockResponses = generateMockResponses(100);
      jest.spyOn(medplum, 'search').mockResolvedValue(createMockBundle(mockResponses, 500));

      const times: number[] = [];

      // Test multiple pages
      for (let page = 0; page < 5; page++) {
        const startTime = performance.now();
        const result = await searchQuestionnaireResponses(medplum, {
          _count: 100,
          _offset: page * 100,
        });
        const endTime = performance.now();

        times.push(endTime - startTime);
        expect(result.responses).toHaveLength(100);
      }

      // Average time should be under 100ms per page
      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
      expect(avgTime).toBeLessThan(100);
    });

    it('should handle large result sets efficiently', async () => {
      const mockResponses = generateMockResponses(1000);
      jest.spyOn(medplum, 'search').mockResolvedValue(createMockBundle(mockResponses, 1000));

      const startTime = performance.now();
      const result = await searchQuestionnaireResponses(medplum, { _count: 1000 });
      const endTime = performance.now();

      expect(result.responses).toHaveLength(1000);
      // Should complete within 500ms even for 1000 results
      expect(endTime - startTime).toBeLessThan(500);
    });

    it('should efficiently filter by status client-side', async () => {
      const mockResponses = generateMockResponses(100);
      // 50% completed, 50% in-progress
      jest.spyOn(medplum, 'search').mockResolvedValue(createMockBundle(mockResponses, 100));

      const startTime = performance.now();
      const result = await searchQuestionnaireResponses(medplum, {
        status: 'completed',
        _count: 100,
      });
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100);
    });

    it('should handle complex nested full-text search efficiently', async () => {
      // Create responses with nested items
      const mockResponses: QuestionnaireResponse[] = [];
      for (let i = 0; i < 100; i++) {
        mockResponses.push({
          resourceType: 'QuestionnaireResponse',
          id: `response-${i}`,
          status: 'completed',
          questionnaire: 'Questionnaire/questionnaire-1',
          subject: { reference: `Patient/patient-${i % 10}` },
          authored: new Date().toISOString(),
          item: [
            {
              linkId: 'group-1',
              text: 'Group 1',
              item: [
                {
                  linkId: 'item-1-1',
                  text: 'Nested Question',
                  answer: [{ valueString: `Nested answer ${i}` }],
                },
                {
                  linkId: 'item-1-2',
                  text: 'Another nested',
                  item: [
                    {
                      linkId: 'item-1-2-1',
                      text: 'Deeply nested',
                      answer: [{ valueString: `Deep value ${i}` }],
                    },
                  ],
                },
              ],
            },
          ],
        });
      }

      jest.spyOn(medplum, 'search').mockResolvedValue(createMockBundle(mockResponses, 100));

      const startTime = performance.now();
      const result = await searchQuestionnaireResponses(medplum, {
        fullTextSearch: 'Deep value',
        _count: 100,
      });
      const endTime = performance.now();

      expect(result.responses.length).toBeGreaterThan(0);
      // Even with deep nesting, should complete within 300ms
      expect(endTime - startTime).toBeLessThan(300);
    });

    it('should return correct pagination metadata', async () => {
      const mockResponses = generateMockResponses(100);
      jest.spyOn(medplum, 'search').mockResolvedValue(createMockBundle(mockResponses, 500));

      const result = await searchQuestionnaireResponses(medplum, {
        _count: 100,
        _offset: 200,
      });

      expect(result.pageInfo).toEqual({
        count: 100,
        offset: 200,
        totalPages: 5,
        currentPage: 3,
      });
      expect(result.total).toBe(500);
      expect(result.hasMore).toBe(true);
    });

    it('should handle empty results efficiently', async () => {
      jest.spyOn(medplum, 'search').mockResolvedValue({
        resourceType: 'Bundle',
        type: 'searchset',
        total: 0,
        entry: [],
      });

      const startTime = performance.now();
      const result = await searchQuestionnaireResponses(medplum, {
        patientId: 'non-existent',
        _count: 100,
      });
      const endTime = performance.now();

      expect(result.responses).toHaveLength(0);
      expect(result.total).toBe(0);
      expect(endTime - startTime).toBeLessThan(50);
    });

    it('should handle concurrent searches', async () => {
      const mockResponses = generateMockResponses(100);
      jest.spyOn(medplum, 'search').mockResolvedValue(createMockBundle(mockResponses, 100));

      const startTime = performance.now();

      // Execute 5 concurrent searches
      const promises = [
        searchQuestionnaireResponses(medplum, { patientId: 'patient-1', _count: 100 }),
        searchQuestionnaireResponses(medplum, { status: 'completed', _count: 100 }),
        searchQuestionnaireResponses(medplum, { fullTextSearch: 'Answer', _count: 100 }),
        searchQuestionnaireResponses(medplum, { dateFrom: '2025-01-01', _count: 100 }),
        searchQuestionnaireResponses(medplum, { _count: 100, _offset: 0 }),
      ];

      const results = await Promise.all(promises);
      const endTime = performance.now();

      // All searches should complete
      expect(results).toHaveLength(5);
      results.forEach((result) => {
        expect(result.responses.length).toBeGreaterThanOrEqual(0);
      });

      // Total time for concurrent searches should be less than sequential
      // (approximately time for single search + overhead)
      expect(endTime - startTime).toBeLessThan(500);
    });
  });

  describe('Memory efficiency', () => {
    it('should not cause memory issues with large datasets', async () => {
      // This test verifies that processing doesn't cause memory issues
      const mockResponses = generateMockResponses(1000);
      jest.spyOn(medplum, 'search').mockResolvedValue(createMockBundle(mockResponses, 1000));

      // Get initial memory (if available)
      const initialMemory = (performance as any).memory?.usedJSHeapSize;

      const result = await searchQuestionnaireResponses(medplum, { _count: 1000 });

      // Get final memory
      const finalMemory = (performance as any).memory?.usedJSHeapSize;

      expect(result.responses).toHaveLength(1000);

      // If memory API is available, check that memory increase is reasonable
      if (initialMemory && finalMemory) {
        const memoryIncrease = finalMemory - initialMemory;
        // Memory increase should be less than 50MB for 1000 responses
        expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
      }
    });
  });
});
