# EMR UI Layout Contracts

This directory contains contract definitions for the EMR UI Layout feature.

## Overview

While this is primarily a UI-only feature, these contracts define the structure and expectations for:
1. **Routing** - URL paths and navigation structure
2. **Translations** - JSON schema for translation files
3. **LocalStorage** - Storage key/value contracts

## Files

- `routing-schema.json` - Defines all EMR routes and their parameters
- `translation-schema.json` - JSON Schema for validating translation files
- `localstorage-contract.md` - Documents localStorage keys and value formats

## Purpose

These contracts serve as:
- **Documentation** for developers adding new menu items or translations
- **Validation** for build-time checks (translation completeness)
- **Integration contracts** for future backend API integration

## Usage

### Validating Translations

```bash
# Use JSON Schema to validate translation files
npx ajv-cli validate -s contracts/translation-schema.json -d src/emr/translations/ka.json
npx ajv-cli validate -s contracts/translation-schema.json -d src/emr/translations/en.json
npx ajv-cli validate -s contracts/translation-schema.json -d src/emr/translations/ru.json
```

### Route Testing

Routes defined in `routing-schema.json` should be tested in integration tests to ensure all paths are accessible and render correctly.
