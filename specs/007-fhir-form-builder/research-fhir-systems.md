# FHIR Questionnaire Implementation: Comprehensive Research Report

**Document Version**: 1.0
**Date**: November 21, 2025
**Author**: Research for MediMind EMR FHIR Form Builder System

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [FHIR Questionnaire/QuestionnaireResponse Official Specifications](#1-fhir-questionnairequestionnaireresponse-official-specifications)
3. [Healthcare Form Builder Systems](#2-healthcare-form-builder-systems)
4. [FHIR Questionnaire Tools & Libraries](#3-fhir-questionnaire-tools--libraries)
5. [Medical-Grade Form Requirements](#4-medical-grade-form-requirements)
6. [Implementation Recommendations](#5-implementation-recommendations)
7. [References](#6-references)

---

## Executive Summary

This research document provides comprehensive findings on FHIR Questionnaire implementation best practices, healthcare form builder systems, available tools/libraries, and regulatory compliance requirements. The research covers:

- **Official HL7 FHIR specifications** for Questionnaire and QuestionnaireResponse resources (FHIR R4, R5, R6)
- **Structured Data Capture (SDC) Implementation Guide** - the primary guide for advanced questionnaire features
- **Production healthcare systems**: Epic MyChart, Cerner PowerForms, REDCap
- **Open-source libraries**: LHC-Forms (NLM), SurveyJS, Android FHIR SDK, FHIRFormJS
- **Regulatory requirements**: 21 CFR Part 11, HIPAA audit trails, FDA data integrity guidelines
- **Real-world case studies** from hospitals and clinical research organizations

**Key Finding**: The combination of **FHIR SDC Implementation Guide** + **LHC-Forms rendering library** + **Medplum platform** provides the most robust foundation for building a production-grade medical form system.

---

## 1. FHIR Questionnaire/QuestionnaireResponse Official Specifications

### 1.1 Official HL7 FHIR Documentation

#### Primary Specifications

| Resource | FHIR R4 | FHIR R5 | FHIR R6 (Ballot) |
|----------|---------|---------|------------------|
| **Questionnaire** | [R4 Spec](http://hl7.org/fhir/R4/questionnaire.html) | [R5 Spec](http://hl7.org/fhir/questionnaire.html) | [R6 Spec](https://build.fhir.org/questionnaire.html) |
| **QuestionnaireResponse** | [R4 Spec](http://hl7.org/fhir/R4/questionnaireresponse.html) | [R5 Spec](http://hl7.org/fhir/questionnaireresponse.html) | [R6 Spec](https://build.fhir.org/questionnaireresponse.html) |

**Official GitHub Repository**: https://github.com/HL7/fhir

#### Core Resource Purpose

> "The general recommendation in FHIR is to use questionnaires for **raw data capture** but then convert the resulting QuestionnaireResponse instances into other FHIR resources."
>
> — HL7 FHIR Specification

**Questionnaire** organizes collections of questions to gather healthcare information. **QuestionnaireResponse** captures the answers provided by users.

### 1.2 Structured Data Capture (SDC) Implementation Guide ⭐

**The SDC Implementation Guide is THE PRIMARY GUIDE for production FHIR questionnaire systems.**

#### Official Resources

- **Current Version**: STU 3 (v3.0.0)
- **Latest Build**: https://build.fhir.org/ig/HL7/sdc/
- **Official IG**: https://hl7.org/fhir/uv/sdc/

#### Key Capabilities Addressed by SDC

1. **Form Population** - Pre-populate forms with existing EHR data
2. **Data Extraction** - Convert QuestionnaireResponse to FHIR resources
3. **Advanced Rendering** - Control form appearance and behavior
4. **Form Behavior** - Skip logic, calculated values, validation
5. **Adaptive Forms** - Dynamic forms that adapt to user responses

### 1.3 Form Population (Pre-Population)

**Purpose**: Reduce data entry burden by automatically filling in answers already known to the EHR.

**Documentation**: https://hl7.org/fhir/uv/sdc/population.html

**How It Works**:
- Questionnaires can define mappings to existing FHIR resources
- Use `initialExpression` extension with FHIRPath expressions
- Support for `$populate` operation to fetch and fill data

**Example**:
```json
{
  "linkId": "patient-name",
  "text": "Patient Name",
  "type": "string",
  "extension": [{
    "url": "http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression",
    "valueExpression": {
      "language": "text/fhirpath",
      "expression": "Patient.name.given.first() + ' ' + Patient.name.family"
    }
  }]
}
```

### 1.4 Data Extraction (Transform QuestionnaireResponse to FHIR Resources)

**Purpose**: Allow captured data to be easily searched, compared, and used by other FHIR systems.

**Documentation**: https://hl7.org/fhir/uv/sdc/extraction.html

#### Three Extraction Approaches

| Approach | Complexity | Power | Use Case |
|----------|-----------|-------|----------|
| **Observation-Based** | Simple | Low | Basic form data → Observations |
| **Definition-Based** | Medium | Medium | Map to specific data elements |
| **StructureMap-Based** | Complex | High | Complex transformations, code translations |

#### StructureMap-Based Extraction (Recommended for Complex Forms)

**Most sophisticated and powerful approach** - allows significant data transformation.

**Example**: Converting patient registration form to Patient + Encounter + Observations

**Official Example**: [HL7 SDOH Clinical Care Guide](https://hl7.org/fhir/us/sdoh-clinicalcare/mapping_instructions.html)

**Tutorial**: https://github.com/ahdis/fhir-mapping-tutorial/

**Code Example**:
```fhir
map "http://example.org/StructureMap/PatientRegistration" = "PatientRegistration"

uses "http://hl7.org/fhir/StructureDefinition/QuestionnaireResponse" as source
uses "http://hl7.org/fhir/StructureDefinition/Patient" as target

group QuestionnaireResponse(source src : QuestionnaireResponse, target patient : Patient) {
  src.item as item where(linkId = 'patient-name') then {
    item.answer as answer -> patient.name as name then {
      answer.value as value -> name.text = value "setName";
    };
  };
}
```

### 1.5 Advanced Form Rendering

**Documentation**: https://build.fhir.org/ig/HL7/sdc/rendering.html

**SDC Render Profile**: https://build.fhir.org/ig/HL7/sdc/StructureDefinition-sdc-questionnaire-render.html

#### Key Rendering Extensions

| Extension | URL | Purpose |
|-----------|-----|---------|
| **rendering-style** | `http://hl7.org/fhir/StructureDefinition/rendering-style` | CSS styling hints |
| **rendering-xhtml** | `http://hl7.org/fhir/StructureDefinition/rendering-xhtml` | Rich text content |
| **questionnaire-itemControl** | `http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl` | Widget type (dropdown, radio, slider) |
| **questionnaire-choiceOrientation** | `http://hl7.org/fhir/StructureDefinition/questionnaire-choiceOrientation` | Horizontal/vertical layout |
| **questionnaire-hidden** | `http://hl7.org/fhir/StructureDefinition/questionnaire-hidden` | Hide from user |
| **questionnaire-usageMode** | `http://hl7.org/fhir/StructureDefinition/questionnaire-usageMode` | Capture vs. display mode |

**Example**:
```json
{
  "linkId": "gender",
  "text": "Gender",
  "type": "choice",
  "extension": [{
    "url": "http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl",
    "valueCodeableConcept": {
      "coding": [{
        "system": "http://hl7.org/fhir/questionnaire-item-control",
        "code": "radio-button"
      }]
    }
  }, {
    "url": "http://hl7.org/fhir/StructureDefinition/questionnaire-choiceOrientation",
    "valueCode": "horizontal"
  }]
}
```

### 1.6 Conditional Logic (enableWhen / Skip Logic)

**Purpose**: Show/hide questions based on previous answers.

**Documentation**: Built into core FHIR spec (Questionnaire.item.enableWhen)

#### Basic Example

```json
{
  "linkId": "pregnant",
  "text": "Are you pregnant?",
  "type": "boolean"
},
{
  "linkId": "due-date",
  "text": "Expected due date",
  "type": "date",
  "enableWhen": [{
    "question": "pregnant",
    "operator": "=",
    "answerBoolean": true
  }]
}
```

#### Advanced: enableWhenExpression (SDC Extension)

For complex logic, use FHIRPath expressions:

```json
{
  "linkId": "bmi-warning",
  "text": "Your BMI is outside normal range",
  "type": "display",
  "extension": [{
    "url": "http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-enableWhenExpression",
    "valueExpression": {
      "language": "text/fhirpath",
      "expression": "%weight / (%height * %height) < 18.5 or %weight / (%height * %height) > 25"
    }
  }]
}
```

### 1.7 Validation Best Practices

**Source**: [Medplum Questionnaires Documentation](https://www.medplum.com/docs/questionnaires/questionnaires-and-responses)

#### Status-Dependent Validation

> "Rules imposed by a Questionnaire about expectations for answers are not expected to be met until a Questionnaire is deemed to be 'completed' (or 'amended')."

**Key Points**:
- Required fields can be omitted while `status = 'in-progress'`
- Full validation only applies when `status = 'completed'`
- QuestionnaireResponses can be saved in incomplete state

#### Validation Areas

1. **Item Types/Datatypes** - Using `linkId` to match Questionnaire ↔ QuestionnaireResponse
2. **Terminology Validation** - ValueSet bindings for coded answers
3. **Required Fields** - `required = true`
4. **Enable When Conditions** - Skip logic validation
5. **Repeating Fields** - Cardinality constraints (min/max occurrences)
6. **Answer Options** - Constrain to predefined choices

#### Pre-Extraction Validation

> "When invoking the $extract operation, care should be taken that the submitted QuestionnaireResponse is itself valid. If not, the extract operation could fail (with appropriate OperationOutcomes) or, more problematic, might succeed but provide incorrect output."

---

## 2. Healthcare Form Builder Systems

### 2.1 REDCap (Research Electronic Data Capture) ⭐

**Website**: https://projectredcap.org/

#### Overview

REDCap is a **browser-based, metadata-driven EDC software** created in 2004 at Vanderbilt University. It's the **gold standard for clinical research data capture**.

**Research Publications**:
- [Original REDCap Paper (2009)](https://pmc.ncbi.nlm.nih.gov/articles/PMC2700030/)
- [REDCap Consortium Paper (2019)](https://pmc.ncbi.nlm.nih.gov/articles/PMC5764586/)

#### Key Statistics

- **5,900+ institutional partners** in 145 countries
- **2.1 million+ end-users** worldwide
- HIPAA compliant
- 21 CFR Part 11 compliant (for FDA-regulated research)

#### Core Features

| Feature | Description |
|---------|-------------|
| **Online Designer** | Setup wizard for non-technical users |
| **Data Dictionary** | Excel spreadsheet for advanced users with field knowledge |
| **Shared Library** | Pre-built instruments (PHQ-9, GAD-7, etc.) |
| **Branching Logic** | Conditional display based on answers |
| **Calculated Fields** | Auto-compute values from other fields |
| **Data Validation** | Real-time validation, integrity checks |
| **Audit Trail** | Complete history of changes |
| **API Access** | RESTful API for integration |
| **Mobile Support** | Responsive design for tablets/phones |

#### Form Creation Methods

1. **Online Designer** - Visual drag-and-drop interface
2. **Data Dictionary** - CSV/Excel upload with field definitions
3. **Shared Library** - Import pre-built forms (LOINC-coded assessments)

#### Lessons for Our Implementation

✅ **Provide multiple authoring methods** (GUI builder + JSON import + template library)
✅ **Branching logic is essential** for complex medical forms
✅ **Pre-built form library** accelerates adoption
✅ **Excel import/export** for bulk form management
✅ **Audit trail** is non-negotiable for medical data

### 2.2 Epic MyChart eForms

**Website**: https://www.mychart.org/

#### Overview

Epic's patient-facing form system integrating with Epic EHR (electronic health record).

#### Key Features

| Feature | Implementation |
|---------|---------------|
| **Pre-Population** | Automatically fills patient data from EHR |
| **Responsive Design** | Adapts to mobile/tablet/desktop |
| **Appointment Integration** | Forms appear in appointment details |
| **Near Real-Time Sync** | Completed forms appear in Epic in seconds |
| **Electronic Signatures** | Built-in signature capture |
| **Rule-Based Display** | Show right forms at right time based on visit data |

#### Implementation Model

1. **Configuration in Epic** - Admins set up reusable rules
2. **Automatic Routing** - System determines which forms to display
3. **Patient Completion** - Patient fills out before/during/after visit
4. **Auto-Storage** - Completed forms route to patient record (ECM or Epic)

#### Reported Benefits (One Health System)

- **10,000 digital forms completed annually**
- **500 hours saved annually** (previously spent prepping/scanning paper consent forms)

#### Lessons for Our Implementation

✅ **Auto-population from patient record** reduces data entry
✅ **Smart form routing** based on appointment type/clinical context
✅ **Mobile-first design** is critical for patient-facing forms
✅ **Real-time sync** to EHR improves workflow
✅ **Electronic signatures** with audit trail

### 2.3 Cerner PowerForms

**Product**: Cerner PowerChart Electronic Medical Record

#### Overview

PowerForms are **structured templates within Cerner EMR** for standardized clinical documentation.

**Research**: [PowerForms in Clinical Data Capture Study](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5855191/)

#### Key Features

| Feature | Description |
|---------|-------------|
| **Structured Templates** | Ensure consistency across clinical settings |
| **Customization** | Fields tailored to department/specialty needs |
| **EHR Integration** | Seamless integration with patient's health record |
| **Validation** | Built-in validation, mandatory field prompts |
| **Ad Hoc Charting** | Document results not originally ordered |
| **PowerForm Library** | Reusable form catalog ("Ad Hoc folder") |

#### Technical Architecture

- **PowerChart Application** - Base EMR system
- **PowerForms Builder** - Technical build tool for templates
- **Organizer Integration** - Access from any patient chart view

#### Lessons for Our Implementation

✅ **Form library/catalog** for reusable templates
✅ **Department-specific customization** while maintaining standards
✅ **Validation at point of entry** prevents errors
✅ **Ad-hoc documentation support** for unordered tests/procedures
✅ **Specialty-specific templates** (cardiology, radiology, etc.)

### 2.4 Comparison Table: Commercial Form Systems

| Feature | REDCap | Epic MyChart | Cerner PowerForms |
|---------|--------|--------------|-------------------|
| **Primary Use Case** | Clinical research | Patient intake | Clinical documentation |
| **User Base** | Researchers | Patients | Clinicians |
| **Open Source** | ✅ Yes (free for non-profit) | ❌ No | ❌ No |
| **FHIR Support** | Limited | Yes (Epic on FHIR) | Limited |
| **Branching Logic** | ✅ Excellent | ✅ Good | ✅ Good |
| **Pre-Population** | ❌ Limited | ✅ Excellent | ✅ Excellent |
| **Mobile Support** | ✅ Responsive | ✅ Native | ✅ Responsive |
| **Audit Trail** | ✅ Full | ✅ Full | ✅ Full |
| **Learning Curve** | Low | Medium | High |

---

## 3. FHIR Questionnaire Tools & Libraries

### 3.1 LHC-Forms (NLM) ⭐ RECOMMENDED

**Website**: https://lhcforms.nlm.nih.gov/
**GitHub**: https://github.com/lhncbc/lforms
**Documentation**: https://lhncbc.github.io/lforms/

#### Overview

**LHC-Forms** is an **open-source JavaScript Web Component** from the **National Library of Medicine (NLM)** that renders FHIR Questionnaires.

**Status**: Production-ready, actively maintained by US government (NIH/NLM)

#### Key Features

✅ **Partial SDC Support** - Supports HL7 FHIR Questionnaire SDC profile
✅ **Framework-Agnostic** - Works with React, Angular, Vue, vanilla JS
✅ **2000+ Pre-Built Forms** - LOINC-coded assessments (PHQ-9, GAD-7, etc.)
✅ **FHIR Import/Export** - Convert FHIR Questionnaire ↔ LForms format
✅ **Auto-Complete** - AJAX lookups for large ValueSets
✅ **Unit Support** - Numeric fields with UCUM units
✅ **SMART on FHIR** - Integrates with EHRs via SMART App Launch

#### Demo & Tools

- **Demo App**: https://lhcforms.nlm.nih.gov/lforms-fhir-app/
- **Form Builder**: https://lhcformbuilder.nlm.nih.gov/
- **NIH Form Repository**: Pre-built LOINC questionnaires

#### Installation

```bash
npm install lhc-forms
```

#### Usage Example (React)

```javascript
import LForms from 'lhc-forms';
import 'lhc-forms/dist/styles.css';

// Load FHIR Questionnaire
const fhirQuestionnaire = await fetch('/api/Questionnaire/123').then(r => r.json());

// Convert to LForms format
const lformsQuestionnaire = LForms.Util.convertFHIRQuestionnaireToLForms(
  fhirQuestionnaire,
  'R4'
);

// Render form
LForms.Util.addFormToPage(lformsQuestionnaire, 'formContainer');

// Get QuestionnaireResponse
const response = LForms.Util.getFormFHIRData(
  'QuestionnaireResponse',
  'R4',
  '#formContainer'
);
```

#### Supported Question Types

- Text (string, text)
- Choice (single-select, multi-select)
- Integer, Decimal
- Date, DateTime, Time
- Boolean
- Quantity (with units)
- Attachment
- URL
- Display (read-only text)

#### Pros & Cons

**Pros**:
- ✅ **Government-backed** - NLM/NIH maintains it
- ✅ **Production-ready** - Used by VA, NIH, other healthcare orgs
- ✅ **2000+ pre-built forms** from LOINC
- ✅ **SMART on FHIR integration**
- ✅ **Active development** - Regular updates

**Cons**:
- ⚠️ **Partial SDC support** - Not all SDC extensions implemented
- ⚠️ **Older UI** - Not as modern as SurveyJS
- ⚠️ **Limited customization** - Less control over styling

#### Recommendation

**Best for**: Healthcare organizations wanting **production-ready, government-backed solution** with access to 2000+ validated medical forms.

### 3.2 SurveyJS ⭐ ALTERNATIVE

**Website**: https://surveyjs.io/
**Healthcare Page**: https://surveyjs.io/healthcare
**GitHub**: https://github.com/surveyjs/survey-library

#### Overview

**SurveyJS** is an **open-source TypeScript/JavaScript library** for building forms and surveys. While not healthcare-specific, it's **HIPAA-compliant** and used by healthcare organizations.

#### Key Features

✅ **Modern UI** - Beautiful, highly customizable interface
✅ **FHIR Support** - Via `questionnaire-to-survey` npm package
✅ **Visual Form Builder** - Drag-and-drop designer
✅ **React/Angular/Vue/jQuery** - Framework integrations
✅ **Conditional Logic** - Advanced skip logic, calculated values
✅ **Mobile-First** - Responsive design
✅ **Themes** - Pre-built themes + custom CSS

#### FHIR Integration

**Package**: `questionnaire-to-survey` - Converts FHIR Questionnaire → SurveyJS format

```bash
npm install questionnaire-to-survey survey-react
```

**Usage**:
```javascript
import { Model } from 'survey-core';
import { Survey } from 'survey-react-ui';
import { fhirToSurveyJS } from 'questionnaire-to-survey';

const fhirQuestionnaire = { /* FHIR Questionnaire */ };
const surveyJSON = fhirToSurveyJS(fhirQuestionnaire);
const survey = new Model(surveyJSON);

<Survey model={survey} />
```

#### Pros & Cons

**Pros**:
- ✅ **Modern UI** - Best-in-class user experience
- ✅ **Highly customizable** - Full control over styling
- ✅ **Excellent docs** - Comprehensive documentation
- ✅ **Active community** - Large user base

**Cons**:
- ⚠️ **FHIR conversion required** - Not native FHIR support
- ⚠️ **Medical forms not included** - No pre-built medical assessments
- ⚠️ **Commercial license** - Free for open-source, paid for commercial

#### Recommendation

**Best for**: Organizations prioritizing **modern UX** and needing **extensive customization** beyond what LHC-Forms offers.

### 3.3 Google Android FHIR SDK (Mobile)

**Website**: https://developers.google.com/open-health-stack/android-fhir
**GitHub**: https://github.com/google/android-fhir

#### Overview

**Android FHIR SDK** from Google includes a **Structured Data Capture Library** for rendering FHIR Questionnaires on Android devices.

#### Key Features

✅ **Native Android** - Kotlin-first, Material Design
✅ **Full SDC Support** - Implements SDC Implementation Guide
✅ **Offline-First** - Works without internet connection
✅ **FHIR Integration** - Native FHIR resource handling
✅ **FHIRPath Support** - Dynamic logic via FHIRPath expressions

#### Main APIs

- **QuestionnaireFragment** - Main UI component for rendering
- **ResourceMapper** - Handles data extraction and population
- **QuestionnaireViewModel** - State management

#### Codelab

**Tutorial**: https://developers.google.com/open-health-stack/codelabs/data-capture

#### Recommendation

**Best for**: **Mobile health applications** requiring offline FHIR questionnaire support on Android.

### 3.4 Medplum FHIR Questionnaire Support ⭐

**Documentation**: https://www.medplum.com/docs/questionnaires

#### Overview

Medplum provides **native FHIR Questionnaire support** with:

✅ **Questionnaire Resource** - Store forms as FHIR Questionnaires
✅ **QuestionnaireResponse Resource** - Store answers
✅ **Medplum Console** - Visual form builder (Google Forms-like)
✅ **LOINC Integration** - Import questionnaires from NIH (PHQ-9, ADL, etc.)
✅ **Conditional Display** - Show/hide questions based on answers
✅ **Bots for Extraction** - Convert QuestionnaireResponse → FHIR resources

#### Example: Patient Intake Form

```json
{
  "resourceType": "Questionnaire",
  "id": "patient-intake",
  "title": "New Patient Intake Form",
  "status": "active",
  "item": [
    {
      "linkId": "demographics",
      "text": "Demographics",
      "type": "group",
      "item": [
        {
          "linkId": "name",
          "text": "Full Name",
          "type": "string",
          "required": true
        },
        {
          "linkId": "dob",
          "text": "Date of Birth",
          "type": "date",
          "required": true
        }
      ]
    }
  ]
}
```

#### Bot-Based Data Extraction

Medplum Bots (AWS Lambda functions) can automatically convert QuestionnaireResponse to other resources:

```typescript
import { BotEvent, MedplumClient } from '@medplum/core';

export async function handler(event: BotEvent, medplum: MedplumClient) {
  const response = event.input;

  // Extract patient data
  const name = findAnswer(response, 'name');
  const dob = findAnswer(response, 'dob');

  // Create Patient resource
  const patient = await medplum.createResource({
    resourceType: 'Patient',
    name: [{ text: name }],
    birthDate: dob
  });

  return patient;
}
```

#### Recommendation

**Best for**: Organizations **already using Medplum** as their FHIR platform - provides seamless integration.

### 3.5 Library Comparison Table

| Library | Best For | FHIR Support | UI Quality | Learning Curve | Open Source | Mobile |
|---------|----------|--------------|------------|----------------|-------------|--------|
| **LHC-Forms** | Production healthcare | Native | Good | Medium | ✅ Yes | Responsive |
| **SurveyJS** | Modern UX | Via converter | Excellent | Low | ✅ Yes* | Responsive |
| **Android FHIR SDK** | Mobile apps | Native | Good | High | ✅ Yes | Native Android |
| **Medplum** | Medplum users | Native | Good | Low | ✅ Yes | Responsive |
| **FHIRFormJS** | React apps | Native | Fair | Medium | ✅ Yes | Responsive |

*SurveyJS: Free for open-source, paid for commercial use

### 3.6 Recommendation for MediMind

**Primary**: **LHC-Forms** + **Medplum Platform**

**Rationale**:
1. ✅ **LHC-Forms** provides production-ready FHIR Questionnaire rendering
2. ✅ **Medplum** provides FHIR backend, Bots for extraction, form builder UI
3. ✅ **2000+ pre-built medical forms** from LOINC via LHC-Forms
4. ✅ **Government-backed** (NLM) ensures long-term support
5. ✅ **SDC compliance** for advanced features
6. ✅ **React integration** matches our existing Mantine/React stack

**Alternative**: **SurveyJS** if modern UX is prioritized over native FHIR support.

---

## 4. Medical-Grade Form Requirements

### 4.1 21 CFR Part 11 Compliance (Electronic Signatures)

**Regulation**: FDA Title 21 CFR Part 11 - Electronic Records; Electronic Signatures

**Official Guidance**: https://www.fda.gov/regulatory-information/search-fda-guidance-documents/part-11-electronic-records-electronic-signatures-scope-and-application

**Full Text**: https://www.ecfr.gov/current/title-21/chapter-I/subchapter-A/part-11

#### Who Must Comply

- Drug manufacturers
- Medical device manufacturers
- Biotech companies
- Biologics developers
- Contract Research Organizations (CROs)
- Clinical trial sponsors

**Applies to**: Records created, modified, maintained, archived, retrieved, or transmitted under FDA regulations.

#### Core Requirements

##### 1. Electronic Signature Authentication

> "Electronic signatures not based on biometrics must employ at least two distinct identification components, such as an identification code and password."
>
> — 21 CFR § 11.200(a)(1)

**Implementation**:
- Username + Password (minimum)
- Multi-factor authentication (recommended)
- Biometric signatures (allowed alternative)

##### 2. Audit Trails (Critical)

> "Use of secure, computer-generated, time-stamped audit trails to independently record the date and time of operator entries and actions that create, modify, or delete electronic records."
>
> — 21 CFR § 11.10(e)

**Requirements**:
- ✅ **Time-stamped** - Date and time of every change
- ✅ **User attribution** - Who made the change
- ✅ **Change details** - What was changed (old value → new value)
- ✅ **Reason for change** - Optional but recommended
- ✅ **Immutable** - Audit trail cannot be modified or disabled
- ✅ **Independent** - Separate from main data

**Example Audit Log Entry**:
```json
{
  "timestamp": "2025-11-21T14:32:15Z",
  "user": "dr.smith@hospital.org",
  "userId": "Practitioner/123",
  "action": "UPDATE",
  "resourceType": "QuestionnaireResponse",
  "resourceId": "QR-456",
  "changes": [
    {
      "field": "item[2].answer[0].valueString",
      "oldValue": "No",
      "newValue": "Yes"
    }
  ],
  "reason": "Patient corrected previous answer"
}
```

##### 3. System Access Controls

> "Limiting system access to authorized individuals."
>
> — 21 CFR § 11.10(d)

**Implementation**:
- Role-based access control (RBAC)
- User authentication
- Session timeouts
- Account lockout after failed attempts

##### 4. Data Integrity & Protection

> "Protection of records to enable their accurate and ready retrieval throughout the records retention period."
>
> — 21 CFR § 11.10(c)

**Requirements**:
- Backups
- Disaster recovery
- Data validation
- Check sums/hashes for integrity

##### 5. System Validation

> "Determine that persons who develop, maintain, or use electronic record/electronic signature systems have the education, training, and experience to perform their assigned tasks."
>
> — 21 CFR § 11.10(i)

**Implementation**:
- System testing and qualification
- User training documentation
- Standard Operating Procedures (SOPs)
- Validation reports

#### Compliance Checklist for Forms

- [ ] **Two-factor authentication** for signatures
- [ ] **Complete audit trail** (time-stamped, user-attributed, immutable)
- [ ] **Role-based access control**
- [ ] **Data encryption** (at rest and in transit)
- [ ] **6-year retention** (minimum)
- [ ] **Backup and recovery** procedures
- [ ] **System validation** documentation
- [ ] **User training** records
- [ ] **SOPs** for system use

### 4.2 HIPAA Audit Trail Requirements

**Regulation**: HIPAA Security Rule § 164.312(b) - Audit Controls

**Official Rule**: https://www.hhs.gov/hipaa/for-professionals/security/laws-regulations/index.html

**Summary Resources**:
- [AuditBoard Guide](https://auditboard.com/blog/hipaa-audit-trail-requirements)
- [Compliancy Group](https://compliancy-group.com/hipaa-audit-log-requirements/)

#### Legal Foundation

> "Implement hardware, software, and/or procedural mechanisms that record and examine activity in information systems that contain or use electronic protected health information (ePHI)."
>
> — 45 C.F.R. § 164.312(b)

#### What Must Be Tracked

**Application Audit Trails**:
- Creating ePHI records
- Reading/viewing ePHI
- Editing ePHI records
- Deleting ePHI records

**System-Level Audit Trails**:
- Log-on attempts (successful and failed)
- Usernames used
- Dates and times of access
- Devices/IP addresses used

**User Audit Trails**:
- All user-initiated events
- Access to ePHI files
- Export/print actions
- Sharing actions

#### Retention Requirements

> "Covered entities and business associates need to have audit controls in place and retain audit log records for a minimum of **six years**."
>
> — HIPAA Security Rule

**State Law Considerations**: Some states require longer retention (7-10 years). **Use the stricter standard.**

#### Storage Requirements

- **Searchable and sortable** - FDA recommendation
- **Secure storage** - Encrypted, access-controlled
- **Regular review** - Based on risk assessment
- **Protected from tampering** - Immutable logs

#### Example HIPAA-Compliant Audit Log

```typescript
interface HIPAAAuditLog {
  id: string;
  timestamp: string; // ISO 8601 format
  eventType: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'ACCESS' | 'EXPORT';

  // User Information
  userId: string;
  userName: string;
  userRole: string;
  ipAddress: string;
  deviceInfo: string;

  // Resource Information
  resourceType: string; // "QuestionnaireResponse", "Patient", etc.
  resourceId: string;

  // Access Details
  accessLevel: 'VIEW' | 'EDIT' | 'FULL';
  dataAccessed: string[]; // Fields accessed

  // Changes (for UPDATE events)
  changes?: Array<{
    field: string;
    oldValue: string;
    newValue: string;
  }>;

  // Justification
  purpose?: string;
  clinicalContext?: string;
}
```

#### HIPAA Audit Checklist for Forms

- [ ] **Track all ePHI access** (view, edit, delete)
- [ ] **Log authentication events** (login, logout, failed attempts)
- [ ] **Record user details** (ID, name, role, IP address)
- [ ] **Time-stamp all events** with synchronized clocks
- [ ] **6-year retention minimum** (longer if state law requires)
- [ ] **Searchable/sortable logs** for investigations
- [ ] **Regular audit log reviews** (quarterly recommended)
- [ ] **Protected from modification** (immutable logs)
- [ ] **Secure storage** (encrypted, access-controlled)
- [ ] **Business Associate Agreements** if using third-party logging

### 4.3 FDA Data Integrity Requirements (2025 Guidance)

**Latest Guidance** (2025): "Electronic Systems, Electronic Records, and Electronic Signatures in Clinical Investigations: Questions and Answers"

**Source**: https://www.fda.gov/media/166215/download

#### ALCOA+ Principles

Data must be:

| Principle | Description | Implementation |
|-----------|-------------|----------------|
| **A**ttributable | Who captured the data? | User ID, timestamp |
| **L**egible | Can it be read? | Plain text, proper encoding |
| **C**ontemporaneous | Recorded at time of event | Real-time entry, not retrospective |
| **O**riginal | First capture, not copy | Source data clearly marked |
| **A**ccurate | Free from errors | Validation, verification |
| **+Complete** | All data present | No missing required fields |
| **+Consistent** | No contradictions | Cross-field validation |
| **+Enduring** | Available for retention period | Backups, long-term storage |
| **+Available** | Retrievable when needed | Searchable, exportable |

#### Key Requirements for Electronic Forms

##### 1. Audit Trail Protection

> "Audit trails should be protected from modification and from being disabled."
>
> — FDA Guidance

**Implementation**:
- Immutable audit logs (write-once storage)
- Separate database/storage for audit logs
- Access restrictions (read-only for most users)
- Alerts if audit logging fails

##### 2. Audit Trail Level of Detail

> "It is not necessary to record every key stroke in an audit trail, however, the audit trail should record **deliberate actions** that a user takes to create, modify, or delete electronic records."
>
> — FDA Guidance

**What to Log**:
- ✅ Saving a form
- ✅ Changing an answer
- ✅ Signing a form
- ✅ Deleting a record

**What NOT to Log**:
- ❌ Every keystroke
- ❌ Mouse movements
- ❌ Scrolling

##### 3. Reason for Change

> "Audit trails must capture... the reasons for the changes."
>
> — FDA Guidance

**Implementation**:
```typescript
interface ChangeReason {
  changeType: 'CORRECTION' | 'CLARIFICATION' | 'PROTOCOL_DEVIATION' | 'OTHER';
  reason: string; // Free text explanation
  timestamp: string;
  userId: string;
}
```

##### 4. FDA Inspection Availability

> "All audit trails must be available for FDA inspection."
>
> — FDA Guidance

**Implementation**:
- Export functionality (CSV, PDF, JSON)
- Searchable interface for inspectors
- Documentation of audit trail system
- SOPs for generating audit reports

#### FDA Compliance Checklist for Forms

- [ ] **ALCOA+ principles** implemented
- [ ] **Audit trails protected** from modification
- [ ] **Deliberate actions logged** (not every keystroke)
- [ ] **Reasons for changes** captured
- [ ] **Time-stamped entries** (synchronized clocks)
- [ ] **Available for inspection** (searchable, exportable)
- [ ] **Data validation** at point of entry
- [ ] **Source data identified** (original vs. transcribed)
- [ ] **Electronic signatures** meet 21 CFR Part 11
- [ ] **System validation** documented

### 4.4 Accessibility Requirements (WCAG 2.2)

**Standard**: Web Content Accessibility Guidelines (WCAG) 2.2

**Official Specification**: https://www.w3.org/WAI/WCAG22/quickref/

**US Legal Requirement**: Section 508 of the Rehabilitation Act (Federal agencies must comply)

#### Why Accessibility Matters for Medical Forms

1. **Legal Requirement** - Section 508, ADA compliance
2. **Patient Population** - 26% of US adults have a disability (CDC)
3. **Healthcare Equity** - Accessible forms ensure all patients can participate
4. **Better UX for Everyone** - Benefits all users, not just those with disabilities

#### WCAG 2.2 Level AA Requirements (Healthcare Standard)

##### Perceivable

**1.1 Text Alternatives**
- All images, icons, charts must have alt text
- Form instructions must be text-based (not image-only)

```html
<img src="medication-icon.png" alt="Medication list section" />
```

**1.3 Adaptable**
- Proper semantic HTML (`<label>`, `<fieldset>`, `<legend>`)
- Logical reading order for screen readers
- Relationship between labels and inputs

```html
<label for="blood-pressure">Blood Pressure (mmHg)</label>
<input id="blood-pressure" type="text" aria-describedby="bp-help" />
<small id="bp-help">Enter systolic/diastolic (e.g., 120/80)</small>
```

**1.4 Distinguishable**
- **Minimum contrast ratio**: 4.5:1 for normal text, 3:1 for large text
- **No color-only indicators** (e.g., red = error must also have icon/text)
- **Text resize**: Must work at 200% zoom

##### Operable

**2.1 Keyboard Accessible**
- All form controls must work with keyboard only (no mouse required)
- **Tab order** must be logical
- **Focus indicators** must be visible

```css
input:focus {
  outline: 2px solid #005fcc;
  outline-offset: 2px;
}
```

**2.4 Navigable**
- Descriptive page titles
- Skip navigation links
- Clear focus order
- Descriptive link text (no "click here")

##### Understandable

**3.2 Predictable**
- Consistent navigation
- Consistent identification
- No automatic form submission

**3.3 Input Assistance**
- Error messages must be clear and specific
- Suggestions for fixing errors
- Confirmation for irreversible actions (delete, submit)

```html
<input type="email" required aria-invalid="true" aria-describedby="email-error" />
<div id="email-error" role="alert">
  Error: Email must contain an @ symbol (e.g., user@example.com)
</div>
```

##### Robust

**4.1 Compatible**
- Valid HTML
- Proper ARIA roles and attributes
- Compatible with assistive technologies

#### Screen Reader Requirements

**ARIA Labels for Complex Widgets**:
```html
<div role="radiogroup" aria-labelledby="pain-scale-label">
  <span id="pain-scale-label">Pain Level (0-10)</span>
  <input type="radio" name="pain" value="0" aria-label="No pain (0)" />
  <input type="radio" name="pain" value="5" aria-label="Moderate pain (5)" />
  <input type="radio" name="pain" value="10" aria-label="Severe pain (10)" />
</div>
```

**Live Regions for Dynamic Updates**:
```html
<div role="status" aria-live="polite" aria-atomic="true">
  Form saved successfully.
</div>
```

#### Accessibility Testing Tools

| Tool | Purpose | URL |
|------|---------|-----|
| **axe DevTools** | Automated accessibility testing | https://www.deque.com/axe/ |
| **WAVE** | Visual accessibility evaluation | https://wave.webaim.org/ |
| **NVDA** | Free screen reader (Windows) | https://www.nvaccess.org/ |
| **JAWS** | Popular screen reader (Windows) | https://www.freedomscientific.com/ |
| **VoiceOver** | Built-in screen reader (Mac/iOS) | Built into macOS |
| **Lighthouse** | Chrome DevTools audit | Built into Chrome |

#### Accessibility Checklist for Forms

- [ ] **All form controls have labels** (`<label>` or `aria-label`)
- [ ] **Error messages are descriptive** and associated with fields
- [ ] **Color is not the only indicator** (use icons/text too)
- [ ] **Contrast ratio meets 4.5:1** for text
- [ ] **Keyboard navigation works** (Tab, Enter, Esc)
- [ ] **Focus indicators are visible** (outline on focused elements)
- [ ] **Screen reader announces errors** (role="alert", aria-live)
- [ ] **Conditional fields announced** when they appear
- [ ] **Form sections have headings** (h2, h3, etc.)
- [ ] **Skip links provided** for long forms
- [ ] **Tested with screen reader** (NVDA, JAWS, or VoiceOver)

### 4.5 Data Retention Requirements

#### Federal Requirements

| Regulation | Retention Period | Applies To |
|------------|------------------|------------|
| **HIPAA** | 6 years minimum | All ePHI records, audit logs |
| **21 CFR Part 11** | Duration of record + 6 years | FDA-regulated electronic records |
| **Medicare** | 5 years | Medicare claims, patient records |

#### State Requirements (Examples)

Many states have **longer** retention requirements than federal law:

| State | Medical Records | Notes |
|-------|----------------|-------|
| **California** | 7 years | 7 years from last patient contact |
| **New York** | 6 years | 6 years from last entry |
| **Texas** | 10 years | Adult patients |
| **Georgia** | 10 years | For adults; minors until age 30 |

**Rule**: **Use the LONGEST applicable retention period** (federal, state, or organizational policy).

#### Implementation Recommendations

1. **Default to 10-year retention** for safety
2. **Clearly mark retention dates** on records
3. **Automated deletion** after retention period (with audit log)
4. **Legal hold capability** (prevent deletion if litigation pending)
5. **Secure archival storage** (encrypted, compressed)

---

## 5. Implementation Recommendations

### 5.1 Recommended Architecture for MediMind FHIR Form Builder

Based on research findings, here's the recommended approach:

#### Technology Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **FHIR Backend** | Medplum Server | Already in use, native FHIR support |
| **Form Rendering** | LHC-Forms | Production-ready, NLM-backed, SDC support |
| **Form Builder UI** | Medplum Console + Custom React | Visual builder for admins |
| **Frontend Framework** | React 19 + Mantine UI | Existing stack, consistent with EMR |
| **Data Extraction** | Medplum Bots (AWS Lambda) | Serverless, event-driven |
| **Form Library** | LOINC Questionnaires + Custom | 2000+ pre-built medical forms |

#### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     MediMind EMR Frontend                   │
│                    (React 19 + Mantine)                     │
├─────────────────────────────────────────────────────────────┤
│  Form Builder UI        │  Form Renderer (LHC-Forms)        │
│  (Admin Interface)      │  (Patient/Clinician Interface)    │
│  - Visual designer      │  - Display Questionnaire          │
│  - JSON editor          │  - Capture answers                │
│  - Template library     │  - Validation                     │
│  - Import LOINC forms   │  - Conditional logic              │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS (TLS 1.3)
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      Medplum FHIR Server                    │
│                    (PostgreSQL + Redis)                     │
├─────────────────────────────────────────────────────────────┤
│  FHIR Resources:                                            │
│  - Questionnaire (form definitions)                         │
│  - QuestionnaireResponse (patient answers)                  │
│  - Patient, Practitioner, Encounter, etc.                   │
│                                                              │
│  Audit Logging:                                             │
│  - AuditEvent resources (HIPAA/21 CFR Part 11 compliant)   │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ Event-Driven
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                  Medplum Bots (AWS Lambda)                  │
├─────────────────────────────────────────────────────────────┤
│  Data Extraction Bots:                                      │
│  - QuestionnaireResponse → Patient                          │
│  - QuestionnaireResponse → Observation                      │
│  - QuestionnaireResponse → Condition                        │
│  - QuestionnaireResponse → Encounter                        │
│                                                              │
│  Validation Bots:                                           │
│  - Pre-submission validation                                │
│  - Business rule enforcement                                │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 Implementation Phases

#### Phase 1: Foundation (Weeks 1-2)

**Goal**: Set up basic FHIR Questionnaire storage and rendering

**Tasks**:
1. ✅ Install LHC-Forms (`npm install lhc-forms`)
2. ✅ Create React component wrapper for LHC-Forms
3. ✅ Implement FHIR Questionnaire storage (Medplum)
4. ✅ Implement QuestionnaireResponse storage
5. ✅ Basic form rendering from FHIR Questionnaire
6. ✅ Save completed form as QuestionnaireResponse

**Deliverables**:
- Working form renderer component
- Store/retrieve Questionnaires and QuestionnaireResponses

#### Phase 2: Form Builder UI (Weeks 3-4)

**Goal**: Visual form builder for administrators

**Tasks**:
1. ✅ Design form builder UI (drag-and-drop)
2. ✅ Implement question type selector (text, choice, date, etc.)
3. ✅ Implement conditional logic editor (enableWhen)
4. ✅ Implement validation rules editor
5. ✅ Preview mode (render form as users will see it)
6. ✅ JSON editor (for advanced users)
7. ✅ Save Questionnaire to Medplum

**Deliverables**:
- Admin interface for creating/editing Questionnaires
- Template library (starter templates)

#### Phase 3: LOINC Integration (Weeks 5-6)

**Goal**: Import 2000+ pre-built medical forms

**Tasks**:
1. ✅ Integrate NLM LOINC form API
2. ✅ Build form search/browse UI
3. ✅ Import LOINC Questionnaires to Medplum
4. ✅ Customize imported forms (branding, modifications)
5. ✅ Test common medical assessments (PHQ-9, GAD-7, ADL, etc.)

**Deliverables**:
- LOINC form library
- Import/customize workflow

#### Phase 4: Data Extraction (Weeks 7-8)

**Goal**: Convert QuestionnaireResponse → FHIR resources

**Tasks**:
1. ✅ Design extraction mappings (which form fields → which FHIR resources)
2. ✅ Implement Medplum Bots for extraction
3. ✅ Support observation-based extraction
4. ✅ Support StructureMap-based extraction (complex forms)
5. ✅ Automated extraction on form submission
6. ✅ Manual extraction trigger (for review before extraction)

**Deliverables**:
- Bot-based data extraction
- Admin UI for managing extraction mappings

#### Phase 5: Advanced Features (Weeks 9-10)

**Goal**: SDC advanced capabilities

**Tasks**:
1. ✅ Form population (pre-fill from patient record)
2. ✅ Calculated fields (BMI, scores, etc.)
3. ✅ FHIRPath expressions for complex logic
4. ✅ Styling/rendering hints (SDC extensions)
5. ✅ Multi-page forms with progress indicator
6. ✅ Draft save (incomplete forms)

**Deliverables**:
- Advanced SDC features
- Improved user experience

#### Phase 6: Compliance & Security (Weeks 11-12)

**Goal**: Meet regulatory requirements

**Tasks**:
1. ✅ Implement audit logging (HIPAA compliant)
2. ✅ Implement 21 CFR Part 11 electronic signatures
3. ✅ Implement data retention policies
4. ✅ Accessibility testing (WCAG 2.2 AA)
5. ✅ Security testing (penetration testing)
6. ✅ Create SOPs and training materials

**Deliverables**:
- Compliant audit trail system
- Electronic signature capability
- Accessibility audit report
- Security audit report
- User training materials

### 5.3 Code Examples

#### Example 1: LHC-Forms React Component

```typescript
import React, { useEffect, useRef, useState } from 'react';
import LForms from 'lhc-forms';
import { Questionnaire, QuestionnaireResponse } from '@medplum/fhirtypes';
import { useMedplum } from '@medplum/react';
import 'lhc-forms/dist/styles.css';

interface LHCFormsProps {
  questionnaire: Questionnaire;
  onSubmit: (response: QuestionnaireResponse) => void;
}

export function LHCFormsRenderer({ questionnaire, onSubmit }: LHCFormsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const medplum = useMedplum();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!containerRef.current || isLoaded) return;

    // Convert FHIR Questionnaire to LForms format
    const lformsQuestionnaire = LForms.Util.convertFHIRQuestionnaireToLForms(
      questionnaire,
      'R4'
    );

    // Render form
    LForms.Util.addFormToPage(lformsQuestionnaire, containerRef.current);
    setIsLoaded(true);
  }, [questionnaire, isLoaded]);

  const handleSubmit = () => {
    if (!containerRef.current) return;

    // Get QuestionnaireResponse
    const response = LForms.Util.getFormFHIRData(
      'QuestionnaireResponse',
      'R4',
      containerRef.current
    ) as QuestionnaireResponse;

    // Set status to completed
    response.status = 'completed';
    response.authored = new Date().toISOString();

    // Call parent's onSubmit handler
    onSubmit(response);
  };

  return (
    <div>
      <div ref={containerRef} className="lhc-form-container" />
      <button onClick={handleSubmit} className="btn-primary">
        Submit Form
      </button>
    </div>
  );
}
```

#### Example 2: Medplum Bot for Data Extraction

```typescript
import { BotEvent, MedplumClient } from '@medplum/core';
import { QuestionnaireResponse, Patient, Observation } from '@medplum/fhirtypes';

export async function handler(
  event: BotEvent<QuestionnaireResponse>,
  medplum: MedplumClient
): Promise<void> {
  const response = event.input;

  // Ensure form is completed
  if (response.status !== 'completed') {
    console.log('Form not completed, skipping extraction');
    return;
  }

  // Extract patient demographics
  const patientId = response.subject?.reference?.split('/')[1];
  if (!patientId) {
    throw new Error('No patient reference in QuestionnaireResponse');
  }

  // Find specific answers
  const weight = findAnswer(response, 'weight');
  const height = findAnswer(response, 'height');
  const bloodPressure = findAnswer(response, 'blood-pressure');

  // Create Observation resources
  if (weight) {
    await medplum.createResource<Observation>({
      resourceType: 'Observation',
      status: 'final',
      code: {
        coding: [{
          system: 'http://loinc.org',
          code: '29463-7',
          display: 'Body Weight'
        }]
      },
      subject: { reference: `Patient/${patientId}` },
      valueQuantity: {
        value: parseFloat(weight),
        unit: 'kg',
        system: 'http://unitsofmeasure.org',
        code: 'kg'
      },
      effectiveDateTime: new Date().toISOString()
    });
  }

  if (height) {
    await medplum.createResource<Observation>({
      resourceType: 'Observation',
      status: 'final',
      code: {
        coding: [{
          system: 'http://loinc.org',
          code: '8302-2',
          display: 'Body Height'
        }]
      },
      subject: { reference: `Patient/${patientId}` },
      valueQuantity: {
        value: parseFloat(height),
        unit: 'cm',
        system: 'http://unitsofmeasure.org',
        code: 'cm'
      },
      effectiveDateTime: new Date().toISOString()
    });
  }

  console.log(`Extracted data from QuestionnaireResponse/${response.id}`);
}

// Helper function to find answer by linkId
function findAnswer(
  response: QuestionnaireResponse,
  linkId: string
): string | undefined {
  const item = response.item?.find(i => i.linkId === linkId);
  return item?.answer?.[0]?.valueString;
}
```

#### Example 3: Audit Logging (HIPAA Compliant)

```typescript
import { AuditEvent, QuestionnaireResponse } from '@medplum/fhirtypes';
import { MedplumClient } from '@medplum/core';

export async function logFormSubmission(
  medplum: MedplumClient,
  response: QuestionnaireResponse,
  userId: string
): Promise<void> {
  const auditEvent: AuditEvent = {
    resourceType: 'AuditEvent',
    type: {
      system: 'http://terminology.hl7.org/CodeSystem/audit-event-type',
      code: 'rest',
      display: 'RESTful Operation'
    },
    subtype: [{
      system: 'http://hl7.org/fhir/restful-interaction',
      code: 'create',
      display: 'create'
    }],
    action: 'C', // Create
    recorded: new Date().toISOString(),
    outcome: '0', // Success
    agent: [{
      type: {
        coding: [{
          system: 'http://terminology.hl7.org/CodeSystem/extra-security-role-type',
          code: 'humanuser',
          display: 'Human User'
        }]
      },
      who: {
        reference: `Practitioner/${userId}`
      },
      requestor: true
    }],
    source: {
      observer: {
        display: 'MediMind EMR Form System'
      },
      type: [{
        system: 'http://terminology.hl7.org/CodeSystem/security-source-type',
        code: '4', // Application Server
        display: 'Application Server'
      }]
    },
    entity: [{
      what: {
        reference: `QuestionnaireResponse/${response.id}`
      },
      type: {
        system: 'http://terminology.hl7.org/CodeSystem/audit-entity-type',
        code: '2', // System Object
        display: 'System Object'
      },
      role: {
        system: 'http://terminology.hl7.org/CodeSystem/object-role',
        code: '20', // Job
        display: 'Job'
      }
    }]
  };

  await medplum.createResource(auditEvent);
}
```

### 5.4 Testing Strategy

#### Unit Tests

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LHCFormsRenderer } from './LHCFormsRenderer';
import { MockClient } from '@medplum/mock';
import { Questionnaire } from '@medplum/fhirtypes';

describe('LHCFormsRenderer', () => {
  let medplum: MockClient;

  const mockQuestionnaire: Questionnaire = {
    resourceType: 'Questionnaire',
    status: 'active',
    item: [
      {
        linkId: 'name',
        text: 'Full Name',
        type: 'string',
        required: true
      }
    ]
  };

  beforeEach(() => {
    medplum = new MockClient();
  });

  it('should render form from FHIR Questionnaire', async () => {
    render(
      <LHCFormsRenderer
        questionnaire={mockQuestionnaire}
        onSubmit={jest.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Full Name')).toBeInTheDocument();
    });
  });

  it('should submit QuestionnaireResponse', async () => {
    const onSubmit = jest.fn();

    render(
      <LHCFormsRenderer
        questionnaire={mockQuestionnaire}
        onSubmit={onSubmit}
      />
    );

    // Fill in form
    const input = await screen.findByRole('textbox');
    fireEvent.change(input, { target: { value: 'John Doe' } });

    // Submit
    fireEvent.click(screen.getByText('Submit Form'));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
      const response = onSubmit.mock.calls[0][0];
      expect(response.status).toBe('completed');
    });
  });
});
```

#### Integration Tests

```typescript
import { test, expect } from '@playwright/test';

test('complete patient intake form', async ({ page }) => {
  // Navigate to form
  await page.goto('/emr/forms/patient-intake');

  // Fill in demographics
  await page.fill('[name="firstName"]', 'John');
  await page.fill('[name="lastName"]', 'Doe');
  await page.fill('[name="dateOfBirth"]', '1980-01-15');

  // Fill in medical history
  await page.check('[name="diabetes"]');
  await page.fill('[name="medications"]', 'Metformin 500mg');

  // Submit form
  await page.click('button[type="submit"]');

  // Verify success
  await expect(page.locator('.success-message')).toContainText(
    'Form submitted successfully'
  );

  // Verify data extracted to patient record
  await page.goto('/emr/patient/123');
  await expect(page.locator('.patient-name')).toContainText('John Doe');
});
```

#### Accessibility Tests

```typescript
import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from 'axe-playwright';

test('form is accessible', async ({ page }) => {
  await page.goto('/emr/forms/patient-intake');
  await injectAxe(page);

  // Check for accessibility violations
  await checkA11y(page, null, {
    detailedReport: true,
    detailedReportOptions: {
      html: true
    }
  });
});
```

### 5.5 Performance Optimization

#### Lazy Loading Forms

```typescript
const LHCFormsRenderer = lazy(() => import('./LHCFormsRenderer'));

function FormPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <LHCFormsRenderer questionnaire={questionnaire} />
    </Suspense>
  );
}
```

#### Memoization

```typescript
import { memo, useMemo } from 'react';

export const LHCFormsRenderer = memo(({ questionnaire, onSubmit }: LHCFormsProps) => {
  const lformsQuestionnaire = useMemo(() => {
    return LForms.Util.convertFHIRQuestionnaireToLForms(questionnaire, 'R4');
  }, [questionnaire]);

  // ... rest of component
});
```

#### Caching Questionnaires

```typescript
import { useQuery } from '@tanstack/react-query';

function useQuestionnaire(id: string) {
  const medplum = useMedplum();

  return useQuery({
    queryKey: ['Questionnaire', id],
    queryFn: () => medplum.readResource('Questionnaire', id),
    staleTime: 1000 * 60 * 60, // 1 hour
    cacheTime: 1000 * 60 * 60 * 24, // 24 hours
  });
}
```

---

## 6. References

### Official FHIR Specifications

1. **FHIR R4 Questionnaire**: http://hl7.org/fhir/R4/questionnaire.html
2. **FHIR R5 Questionnaire**: http://hl7.org/fhir/questionnaire.html
3. **FHIR R6 Questionnaire (Ballot)**: https://build.fhir.org/questionnaire.html
4. **FHIR R4 QuestionnaireResponse**: http://hl7.org/fhir/R4/questionnaireresponse.html
5. **SDC Implementation Guide (STU 3)**: https://hl7.org/fhir/uv/sdc/
6. **SDC Implementation Guide (Latest Build)**: https://build.fhir.org/ig/HL7/sdc/
7. **SDC Form Population**: https://hl7.org/fhir/uv/sdc/population.html
8. **SDC Data Extraction**: https://hl7.org/fhir/uv/sdc/extraction.html
9. **SDC Advanced Rendering**: https://build.fhir.org/ig/HL7/sdc/rendering.html

### Healthcare Form Systems

10. **REDCap Project**: https://projectredcap.org/
11. **REDCap Original Paper (2009)**: https://pmc.ncbi.nlm.nih.gov/articles/PMC2700030/
12. **REDCap Consortium Paper (2019)**: https://pmc.ncbi.nlm.nih.gov/articles/PMC5764586/
13. **Epic MyChart**: https://www.mychart.org/
14. **Epic on FHIR**: https://open.epic.com/
15. **Cerner PowerForms**: https://wiki.cerner.com/display/public/1101powerformsHP/

### FHIR Questionnaire Libraries

16. **LHC-Forms Website**: https://lhcforms.nlm.nih.gov/
17. **LHC-Forms GitHub**: https://github.com/lhncbc/lforms
18. **LHC-Forms Documentation**: https://lhncbc.github.io/lforms/
19. **LHC Form Builder**: https://lhcformbuilder.nlm.nih.gov/
20. **SurveyJS**: https://surveyjs.io/
21. **SurveyJS Healthcare**: https://surveyjs.io/healthcare
22. **SurveyJS GitHub**: https://github.com/surveyjs/survey-library
23. **questionnaire-to-survey npm**: https://www.npmjs.com/package/questionnaire-to-survey
24. **Android FHIR SDK**: https://developers.google.com/open-health-stack/android-fhir
25. **Android FHIR SDK GitHub**: https://github.com/google/android-fhir
26. **Android FHIR SDK Codelab**: https://developers.google.com/open-health-stack/codelabs/data-capture
27. **Medplum Questionnaires**: https://www.medplum.com/docs/questionnaires

### Regulatory Compliance

28. **21 CFR Part 11 - Official Text**: https://www.ecfr.gov/current/title-21/chapter-I/subchapter-A/part-11
29. **FDA Part 11 Guidance**: https://www.fda.gov/regulatory-information/search-fda-guidance-documents/part-11-electronic-records-electronic-signatures-scope-and-application
30. **FDA Electronic Systems Guidance (2025)**: https://www.fda.gov/media/166215/download
31. **HIPAA Security Rule**: https://www.hhs.gov/hipaa/for-professionals/security/laws-regulations/index.html
32. **HIPAA Audit Trail Requirements**: https://auditboard.com/blog/hipaa-audit-trail-requirements
33. **WCAG 2.2 Quick Reference**: https://www.w3.org/WAI/WCAG22/quickref/
34. **Section 508**: https://www.section508.gov/

### Case Studies

35. **Converting Paper CRFs to Electronic (Uganda)**: https://pmc.ncbi.nlm.nih.gov/articles/PMC5790431/
36. **Paper to Electronic Data Collection (Zanzibar)**: https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3392743/
37. **Hospital EHR Transition Study (NHS)**: https://pmc.ncbi.nlm.nih.gov/articles/PMC9943586/
38. **FHIR in Clinical Research**: https://www.cdisc.org/kb/articles/use-fhir-clinical-research-electronic-medical-records-analysis

### Tutorials & Examples

39. **FHIR Mapping Tutorial**: https://github.com/ahdis/fhir-mapping-tutorial/
40. **HL7 SDOH Clinical Care Mapping Examples**: https://hl7.org/fhir/us/sdoh-clinicalcare/mapping_instructions.html
41. **Brian Postlethwaite's FHIR Questionnaires Presentation**: https://www.devdays.com/wp-content/uploads/2021/12/DD21US_20210607_Brian_Postlethwaite_FHIR_Questionnaires_And_StrucuredDataCapture.pdf

### Accessibility

42. **WebAIM WCAG Checklist**: https://webaim.org/standards/wcag/checklist
43. **A11Y Project Checklist**: https://www.a11yproject.com/checklist/
44. **axe DevTools**: https://www.deque.com/axe/
45. **WAVE Accessibility Tool**: https://wave.webaim.org/

---

## Appendix A: FHIR Questionnaire Example (Complete)

```json
{
  "resourceType": "Questionnaire",
  "id": "patient-intake-form",
  "url": "http://medimind.ge/Questionnaire/patient-intake",
  "version": "1.0.0",
  "name": "PatientIntakeForm",
  "title": "Patient Intake Form",
  "status": "active",
  "publisher": "MediMind EMR",
  "description": "Comprehensive patient intake questionnaire for new patients",
  "code": [{
    "system": "http://loinc.org",
    "code": "74465-6",
    "display": "Questionnaire form definition Document"
  }],
  "item": [
    {
      "linkId": "demographics",
      "text": "Demographics",
      "type": "group",
      "item": [
        {
          "linkId": "first-name",
          "text": "First Name",
          "type": "string",
          "required": true
        },
        {
          "linkId": "last-name",
          "text": "Last Name",
          "type": "string",
          "required": true
        },
        {
          "linkId": "dob",
          "text": "Date of Birth",
          "type": "date",
          "required": true
        },
        {
          "linkId": "gender",
          "text": "Gender",
          "type": "choice",
          "required": true,
          "answerOption": [
            { "valueCoding": { "code": "male", "display": "Male" } },
            { "valueCoding": { "code": "female", "display": "Female" } },
            { "valueCoding": { "code": "other", "display": "Other" } }
          ],
          "extension": [{
            "url": "http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl",
            "valueCodeableConcept": {
              "coding": [{
                "system": "http://hl7.org/fhir/questionnaire-item-control",
                "code": "radio-button"
              }]
            }
          }]
        }
      ]
    },
    {
      "linkId": "medical-history",
      "text": "Medical History",
      "type": "group",
      "item": [
        {
          "linkId": "chronic-conditions",
          "text": "Do you have any chronic medical conditions?",
          "type": "boolean",
          "required": true
        },
        {
          "linkId": "condition-list",
          "text": "Please list your chronic conditions",
          "type": "text",
          "enableWhen": [{
            "question": "chronic-conditions",
            "operator": "=",
            "answerBoolean": true
          }]
        },
        {
          "linkId": "medications",
          "text": "Current Medications",
          "type": "text",
          "required": false
        },
        {
          "linkId": "allergies",
          "text": "Known Allergies",
          "type": "text",
          "required": false
        }
      ]
    },
    {
      "linkId": "vital-signs",
      "text": "Vital Signs",
      "type": "group",
      "item": [
        {
          "linkId": "weight",
          "text": "Weight",
          "type": "decimal",
          "extension": [{
            "url": "http://hl7.org/fhir/StructureDefinition/questionnaire-unit",
            "valueCoding": {
              "system": "http://unitsofmeasure.org",
              "code": "kg",
              "display": "kg"
            }
          }]
        },
        {
          "linkId": "height",
          "text": "Height",
          "type": "decimal",
          "extension": [{
            "url": "http://hl7.org/fhir/StructureDefinition/questionnaire-unit",
            "valueCoding": {
              "system": "http://unitsofmeasure.org",
              "code": "cm",
              "display": "cm"
            }
          }]
        },
        {
          "linkId": "bmi",
          "text": "BMI (calculated)",
          "type": "decimal",
          "readOnly": true,
          "extension": [{
            "url": "http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-calculatedExpression",
            "valueExpression": {
              "language": "text/fhirpath",
              "expression": "%weight / ((%height / 100) * (%height / 100))"
            }
          }]
        }
      ]
    }
  ]
}
```

---

## Appendix B: Glossary

| Term | Definition |
|------|------------|
| **ALCOA+** | Data integrity principles: Attributable, Legible, Contemporaneous, Original, Accurate, Complete, Consistent, Enduring, Available |
| **eCRF** | Electronic Case Report Form - digital version of paper data collection forms used in clinical trials |
| **enableWhen** | FHIR Questionnaire property that controls conditional display of questions (skip logic) |
| **ePHI** | Electronic Protected Health Information - health data subject to HIPAA regulations |
| **FHIR** | Fast Healthcare Interoperability Resources - HL7 standard for healthcare data exchange |
| **FHIRPath** | Expression language for navigating and extracting data from FHIR resources |
| **LHC-Forms** | Open-source JavaScript library from NLM for rendering FHIR Questionnaires |
| **LOINC** | Logical Observation Identifiers Names and Codes - standard for lab tests and clinical assessments |
| **QuestionnaireResponse** | FHIR resource containing answers to a Questionnaire |
| **SDC** | Structured Data Capture - FHIR implementation guide for advanced questionnaire features |
| **SMART on FHIR** | Standard for launching healthcare apps within EHRs |
| **StructureMap** | FHIR resource for defining data transformations (used in extraction) |
| **WCAG** | Web Content Accessibility Guidelines - standard for accessible web content |

---

**End of Research Document**
