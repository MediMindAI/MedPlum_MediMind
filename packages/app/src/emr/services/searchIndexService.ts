// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

/**
 * @module searchIndexService
 * @description Service for form search indexing with PostgreSQL full-text search support.
 *
 * PLACEHOLDER: This service provides the interface for full-text search indexing.
 * In production, this would integrate with PostgreSQL's full-text search capabilities
 * or a dedicated search engine like Elasticsearch.
 *
 * Current implementation uses client-side filtering on FHIR resources.
 * Future implementation should:
 * 1. Create PostgreSQL GIN indexes on JSONB columns
 * 2. Use tsvector/tsquery for full-text search
 * 3. Support Georgian language stemming
 * 4. Index QuestionnaireResponse answer values
 */

import type { MedplumClient } from '@medplum/core';
import type { QuestionnaireResponse, Questionnaire } from '@medplum/fhirtypes';

/**
 * Search index entry representing a searchable form
 */
export interface SearchIndexEntry {
  /** QuestionnaireResponse ID */
  responseId: string;
  /** Questionnaire ID */
  questionnaireId: string;
  /** Form title */
  formTitle: string;
  /** Patient ID */
  patientId?: string;
  /** Patient name (for search) */
  patientName?: string;
  /** Authored date */
  authoredDate: string;
  /** Status */
  status: string;
  /** Concatenated searchable text from all answers */
  searchText: string;
  /** Indexed at timestamp */
  indexedAt: string;
}

/**
 * Full-text search parameters
 */
export interface FullTextSearchParams {
  /** Search query string */
  query: string;
  /** Optional patient ID filter */
  patientId?: string;
  /** Optional questionnaire ID filter */
  questionnaireId?: string;
  /** Optional status filter */
  status?: string;
  /** Optional date range start */
  dateFrom?: string;
  /** Optional date range end */
  dateTo?: string;
  /** Maximum results (default: 100) */
  limit?: number;
  /** Offset for pagination */
  offset?: number;
}

/**
 * Full-text search result
 */
export interface FullTextSearchResult {
  /** Matching entries */
  entries: SearchIndexEntry[];
  /** Total count (for pagination) */
  totalCount: number;
  /** Search duration in ms */
  searchDurationMs: number;
}

// ============================================================================
// PLACEHOLDER: PostgreSQL Full-Text Search Integration
// ============================================================================

/**
 * PLACEHOLDER: Create full-text search index for forms
 *
 * In production, this would execute:
 * ```sql
 * CREATE INDEX IF NOT EXISTS idx_questionnaire_response_fulltext
 * ON "QuestionnaireResponse"
 * USING GIN (to_tsvector('simple', content::text));
 *
 * -- For Georgian language support:
 * CREATE TEXT SEARCH CONFIGURATION georgian (COPY = simple);
 * -- Add Georgian-specific stemming rules
 * ```
 *
 * @param medplum - Medplum client
 * @returns Promise resolving when index is created
 */
export async function createSearchIndex(medplum: MedplumClient): Promise<void> {
  // PLACEHOLDER: In production, this would call a server-side endpoint
  // to create PostgreSQL indexes
  console.info('[searchIndexService] createSearchIndex: PostgreSQL index creation not implemented');
  console.info('[searchIndexService] Current implementation uses client-side filtering');

  // TODO: Implement server-side index creation via Medplum Bot or custom endpoint
  // Example Bot implementation:
  // await medplum.executeBot(
  //   { reference: 'Bot/search-index-manager' },
  //   { action: 'createIndex', resourceType: 'QuestionnaireResponse' }
  // );
}

/**
 * PLACEHOLDER: Build searchable text from QuestionnaireResponse
 *
 * Extracts all text content from answers for indexing.
 *
 * @param response - QuestionnaireResponse to index
 * @returns Concatenated searchable text
 */
export function buildSearchText(response: QuestionnaireResponse): string {
  const textParts: string[] = [];

  function extractText(items: QuestionnaireResponse['item']): void {
    if (!items) return;

    for (const item of items) {
      // Add item text/label
      if (item.text) {
        textParts.push(item.text);
      }

      // Extract answer values
      if (item.answer) {
        for (const answer of item.answer) {
          if (answer.valueString) textParts.push(answer.valueString);
          if (answer.valueInteger !== undefined) textParts.push(String(answer.valueInteger));
          if (answer.valueDecimal !== undefined) textParts.push(String(answer.valueDecimal));
          if (answer.valueBoolean !== undefined) textParts.push(answer.valueBoolean ? 'true' : 'false');
          if (answer.valueDate) textParts.push(answer.valueDate);
          if (answer.valueDateTime) textParts.push(answer.valueDateTime);
          if (answer.valueCoding?.display) textParts.push(answer.valueCoding.display);
        }
      }

      // Recurse into nested items
      if (item.item) {
        extractText(item.item);
      }
    }
  }

  extractText(response.item);

  return textParts.join(' ').toLowerCase();
}

/**
 * PLACEHOLDER: Index a QuestionnaireResponse for search
 *
 * In production, this would update the PostgreSQL index.
 * Current implementation is a no-op.
 *
 * @param medplum - Medplum client
 * @param response - QuestionnaireResponse to index
 * @param questionnaire - Optional questionnaire for title
 */
export async function indexQuestionnaireResponse(
  medplum: MedplumClient,
  response: QuestionnaireResponse,
  questionnaire?: Questionnaire
): Promise<SearchIndexEntry> {
  // Build index entry
  const entry: SearchIndexEntry = {
    responseId: response.id || '',
    questionnaireId: response.questionnaire?.replace('Questionnaire/', '') || '',
    formTitle: questionnaire?.title || 'Unknown Form',
    patientId: response.subject?.reference?.replace('Patient/', ''),
    authoredDate: response.authored || new Date().toISOString(),
    status: response.status || 'unknown',
    searchText: buildSearchText(response),
    indexedAt: new Date().toISOString(),
  };

  // PLACEHOLDER: In production, insert into search index table
  console.debug('[searchIndexService] Indexed response:', entry.responseId);

  return entry;
}

/**
 * PLACEHOLDER: Perform full-text search
 *
 * In production, this would execute:
 * ```sql
 * SELECT *
 * FROM search_index
 * WHERE to_tsvector('simple', search_text) @@ plainto_tsquery('simple', $1)
 * AND ($2::text IS NULL OR patient_id = $2)
 * AND ($3::text IS NULL OR questionnaire_id = $3)
 * ORDER BY ts_rank(to_tsvector('simple', search_text), plainto_tsquery('simple', $1)) DESC
 * LIMIT $4 OFFSET $5;
 * ```
 *
 * @param medplum - Medplum client
 * @param params - Search parameters
 * @returns Search results
 */
export async function fullTextSearch(
  medplum: MedplumClient,
  params: FullTextSearchParams
): Promise<FullTextSearchResult> {
  const startTime = performance.now();

  // PLACEHOLDER: Current implementation uses FHIR search + client-side filtering
  // In production, this would query a PostgreSQL full-text index

  const searchParams: Record<string, string> = {
    _count: String(params.limit || 100),
    _offset: String(params.offset || 0),
    _sort: '-authored',
  };

  if (params.patientId) {
    searchParams['subject'] = `Patient/${params.patientId}`;
  }

  if (params.questionnaireId) {
    searchParams['questionnaire'] = `Questionnaire/${params.questionnaireId}`;
  }

  if (params.status) {
    searchParams['status'] = params.status;
  }

  if (params.dateFrom) {
    searchParams['authored'] = `ge${params.dateFrom}`;
  }

  // Execute FHIR search
  const bundle = await medplum.search('QuestionnaireResponse', searchParams);

  let responses: QuestionnaireResponse[] = [];
  if (bundle.entry) {
    responses = bundle.entry
      .filter((e) => e.resource?.resourceType === 'QuestionnaireResponse')
      .map((e) => e.resource as QuestionnaireResponse);
  }

  // Client-side full-text filtering
  const query = params.query.toLowerCase().trim();
  if (query) {
    responses = responses.filter((response) => {
      const searchText = buildSearchText(response);
      return searchText.includes(query);
    });
  }

  // Build index entries
  const entries: SearchIndexEntry[] = responses.map((response) => ({
    responseId: response.id || '',
    questionnaireId: response.questionnaire?.replace('Questionnaire/', '') || '',
    formTitle: 'Form', // Would need to fetch questionnaire for title
    patientId: response.subject?.reference?.replace('Patient/', ''),
    authoredDate: response.authored || '',
    status: response.status || '',
    searchText: buildSearchText(response),
    indexedAt: new Date().toISOString(),
  }));

  const endTime = performance.now();

  return {
    entries,
    totalCount: bundle.total || entries.length,
    searchDurationMs: Math.round(endTime - startTime),
  };
}

/**
 * PLACEHOLDER: Reindex all QuestionnaireResponses
 *
 * Would be called during initial setup or after schema changes.
 *
 * @param medplum - Medplum client
 * @param batchSize - Number of records to process per batch
 */
export async function reindexAll(
  medplum: MedplumClient,
  batchSize: number = 100
): Promise<{ indexed: number; errors: number }> {
  console.info('[searchIndexService] reindexAll: Bulk reindexing not implemented');
  console.info('[searchIndexService] This would iterate through all QuestionnaireResponses');
  console.info(`[searchIndexService] Batch size: ${batchSize}`);

  // PLACEHOLDER: Implementation would:
  // 1. Fetch all QuestionnaireResponses in batches
  // 2. Build search text for each
  // 3. Insert into PostgreSQL index table
  // 4. Report progress

  return { indexed: 0, errors: 0 };
}

/**
 * PLACEHOLDER: Drop search index
 *
 * @param medplum - Medplum client
 */
export async function dropSearchIndex(medplum: MedplumClient): Promise<void> {
  console.info('[searchIndexService] dropSearchIndex: Index removal not implemented');

  // PLACEHOLDER: Would execute:
  // DROP INDEX IF EXISTS idx_questionnaire_response_fulltext;
}

// ============================================================================
// Future Implementation Notes
// ============================================================================

/**
 * PostgreSQL Full-Text Search Implementation Notes:
 *
 * 1. Schema for search index table:
 * ```sql
 * CREATE TABLE form_search_index (
 *   id SERIAL PRIMARY KEY,
 *   response_id VARCHAR(64) NOT NULL UNIQUE,
 *   questionnaire_id VARCHAR(64),
 *   patient_id VARCHAR(64),
 *   patient_name TEXT,
 *   form_title TEXT,
 *   authored_date TIMESTAMP,
 *   status VARCHAR(32),
 *   search_text TEXT,
 *   search_vector TSVECTOR,
 *   indexed_at TIMESTAMP DEFAULT NOW()
 * );
 *
 * CREATE INDEX idx_search_vector ON form_search_index USING GIN(search_vector);
 * CREATE INDEX idx_patient_id ON form_search_index(patient_id);
 * CREATE INDEX idx_questionnaire_id ON form_search_index(questionnaire_id);
 * CREATE INDEX idx_authored_date ON form_search_index(authored_date);
 * ```
 *
 * 2. Trigger to auto-update search_vector:
 * ```sql
 * CREATE OR REPLACE FUNCTION update_search_vector()
 * RETURNS TRIGGER AS $$
 * BEGIN
 *   NEW.search_vector := to_tsvector('simple', COALESCE(NEW.search_text, ''));
 *   RETURN NEW;
 * END;
 * $$ LANGUAGE plpgsql;
 *
 * CREATE TRIGGER trig_update_search_vector
 * BEFORE INSERT OR UPDATE ON form_search_index
 * FOR EACH ROW EXECUTE FUNCTION update_search_vector();
 * ```
 *
 * 3. Georgian language support would require:
 *    - Custom text search configuration
 *    - Georgian stemming dictionary
 *    - Possibly Hunspell integration
 *
 * 4. For better performance with large datasets:
 *    - Consider Elasticsearch or OpenSearch
 *    - Use async indexing via message queue
 *    - Implement index sharding
 */
