# API Contracts: Patient History Page

This directory contains TypeScript interface contracts for the Patient History feature services. These contracts define the public API for interacting with patient visit data via FHIR resources.

## Contract Files

1. **patient-history-service.contract.ts** - Main service for Encounter CRUD operations
2. **visit-search-service.contract.ts** - Search and filtering operations
3. **insurance-service.contract.ts** - Coverage resource management
4. **financial-service.contract.ts** - Financial calculations and summaries

## Usage

These contracts are reference specifications. The actual implementation will be in:
- `packages/app/src/emr/services/patientHistoryService.ts`
- `packages/app/src/emr/services/visitSearchService.ts`
- `packages/app/src/emr/services/insuranceService.ts`
- `packages/app/src/emr/services/financialService.ts`

All services use `MedplumClient` from `@medplum/core` for FHIR operations.
