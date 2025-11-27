// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { getRoleTemplates, getRoleTemplateByCode } from './roleTemplateService';

describe('roleTemplateService', () => {
  describe('getRoleTemplates', () => {
    it('should return 16 role templates', () => {
      const templates = getRoleTemplates();
      expect(templates).toHaveLength(16);
    });

    it('should include all expected template codes', () => {
      const templates = getRoleTemplates();
      const codes = templates.map((t) => t.code);

      expect(codes).toContain('owner');
      expect(codes).toContain('admin');
      expect(codes).toContain('physician');
      expect(codes).toContain('nurse');
      expect(codes).toContain('registrar');
      expect(codes).toContain('laboratory');
      expect(codes).toContain('cashier');
      expect(codes).toContain('hrManager');
      expect(codes).toContain('seniorNurse');
      expect(codes).toContain('pharmacyManager');
      expect(codes).toContain('viewAdmin');
      expect(codes).toContain('accounting');
      expect(codes).toContain('manager');
      expect(codes).toContain('operator');
      expect(codes).toContain('externalOrg');
      expect(codes).toContain('technician');
    });

    it('should have required fields for each template', () => {
      const templates = getRoleTemplates();

      templates.forEach((template) => {
        expect(template.code).toBeTruthy();
        expect(template.name).toBeTruthy();
        expect(template.description).toBeTruthy();
        expect(Array.isArray(template.defaultPermissions)).toBe(true);
        expect(typeof template.departmentScoped).toBe('boolean');
      });
    });

    it('should support Georgian language (ka)', () => {
      const templates = getRoleTemplates('ka');

      const ownerTemplate = templates.find((t) => t.code === 'owner');
      expect(ownerTemplate?.name).toBe('სისტემის მფლობელი');
      expect(ownerTemplate?.description).toContain('სრული წვდომა');

      const physicianTemplate = templates.find((t) => t.code === 'physician');
      expect(physicianTemplate?.name).toBe('ექიმი');
      expect(physicianTemplate?.description).toContain('კლინიკური');
    });

    it('should support English language (en)', () => {
      const templates = getRoleTemplates('en');

      const ownerTemplate = templates.find((t) => t.code === 'owner');
      expect(ownerTemplate?.name).toBe('System Owner');
      expect(ownerTemplate?.description).toContain('Full access');

      const physicianTemplate = templates.find((t) => t.code === 'physician');
      expect(physicianTemplate?.name).toBe('Physician');
      expect(physicianTemplate?.description).toContain('Clinical care');
    });

    it('should support Russian language (ru)', () => {
      const templates = getRoleTemplates('ru');

      const ownerTemplate = templates.find((t) => t.code === 'owner');
      expect(ownerTemplate?.name).toBe('Владелец системы');
      expect(ownerTemplate?.description).toContain('Полный доступ');

      const physicianTemplate = templates.find((t) => t.code === 'physician');
      expect(physicianTemplate?.name).toBe('Врач');
      expect(physicianTemplate?.description).toContain('Клиническая');
    });

    it('should fallback to English for unsupported language', () => {
      const templates = getRoleTemplates('fr' as any);

      const ownerTemplate = templates.find((t) => t.code === 'owner');
      expect(ownerTemplate?.name).toBe('System Owner'); // Fallback to English
    });
  });

  describe('template-specific permissions', () => {
    it('owner template should have all permissions', () => {
      const templates = getRoleTemplates();
      const owner = templates.find((t) => t.code === 'owner');

      expect(owner?.defaultPermissions.length).toBeGreaterThan(100);
      expect(owner?.departmentScoped).toBe(false);
      expect(owner?.defaultPage).toBe('/emr/administration');

      // Check for permissions from all categories
      expect(owner?.defaultPermissions).toContain('view-patient-list');
      expect(owner?.defaultPermissions).toContain('view-encounters');
      expect(owner?.defaultPermissions).toContain('view-lab-results');
      expect(owner?.defaultPermissions).toContain('view-invoices');
      expect(owner?.defaultPermissions).toContain('view-users');
      expect(owner?.defaultPermissions).toContain('emergency-access');
    });

    it('physician template should have clinical permissions but no admin', () => {
      const templates = getRoleTemplates();
      const physician = templates.find((t) => t.code === 'physician');

      expect(physician?.departmentScoped).toBe(true);
      expect(physician?.defaultPage).toBe('/emr/patient-history');

      // Should have clinical permissions
      expect(physician?.defaultPermissions).toContain('view-patient-list');
      expect(physician?.defaultPermissions).toContain('create-encounter');
      expect(physician?.defaultPermissions).toContain('prescribe-medication');
      expect(physician?.defaultPermissions).toContain('sign-clinical-notes');

      // Should NOT have admin permissions
      expect(physician?.defaultPermissions).not.toContain('create-user');
      expect(physician?.defaultPermissions).not.toContain('delete-role');
      expect(physician?.defaultPermissions).not.toContain('edit-system-settings');

      // Should NOT have billing permissions
      expect(physician?.defaultPermissions).not.toContain('process-payment');
      expect(physician?.defaultPermissions).not.toContain('void-invoice');
    });

    it('nurse template should have limited clinical permissions', () => {
      const templates = getRoleTemplates();
      const nurse = templates.find((t) => t.code === 'nurse');

      expect(nurse?.departmentScoped).toBe(true);

      // Should have basic clinical permissions
      expect(nurse?.defaultPermissions).toContain('view-patient-list');
      expect(nurse?.defaultPermissions).toContain('create-encounter');
      expect(nurse?.defaultPermissions).toContain('enter-lab-results');

      // Should NOT have prescribing or signing permissions
      expect(nurse?.defaultPermissions).not.toContain('prescribe-medication');
      expect(nurse?.defaultPermissions).not.toContain('sign-clinical-notes');
      expect(nurse?.defaultPermissions).not.toContain('edit-encounter');
    });

    it('registrar template should focus on registration', () => {
      const templates = getRoleTemplates();
      const registrar = templates.find((t) => t.code === 'registrar');

      expect(registrar?.departmentScoped).toBe(false);
      expect(registrar?.defaultPage).toBe('/emr/registration');

      // Should have registration permissions
      expect(registrar?.defaultPermissions).toContain('create-patient');
      expect(registrar?.defaultPermissions).toContain('edit-patient-demographics');
      expect(registrar?.defaultPermissions).toContain('create-appointment');

      // Should NOT have clinical permissions
      expect(registrar?.defaultPermissions).not.toContain('prescribe-medication');
      expect(registrar?.defaultPermissions).not.toContain('sign-clinical-notes');
      expect(registrar?.defaultPermissions).not.toContain('approve-lab-results');
    });

    it('laboratory template should focus on lab operations', () => {
      const templates = getRoleTemplates();
      const laboratory = templates.find((t) => t.code === 'laboratory');

      expect(laboratory?.departmentScoped).toBe(true);
      expect(laboratory?.defaultPage).toBe('/emr/nomenclature/laboratory');

      // Should have lab permissions
      expect(laboratory?.defaultPermissions).toContain('view-lab-orders');
      expect(laboratory?.defaultPermissions).toContain('enter-lab-results');
      expect(laboratory?.defaultPermissions).toContain('approve-lab-results');
      expect(laboratory?.defaultPermissions).toContain('manage-specimens');
      expect(laboratory?.defaultPermissions).toContain('manage-lab-equipment');

      // Should NOT have clinical or billing permissions
      expect(laboratory?.defaultPermissions).not.toContain('prescribe-medication');
      expect(laboratory?.defaultPermissions).not.toContain('process-payment');
    });

    it('cashier template should focus on payments', () => {
      const templates = getRoleTemplates();
      const cashier = templates.find((t) => t.code === 'cashier');

      expect(cashier?.departmentScoped).toBe(false);

      // Should have payment permissions
      expect(cashier?.defaultPermissions).toContain('view-invoices');
      expect(cashier?.defaultPermissions).toContain('process-payment');
      expect(cashier?.defaultPermissions).toContain('view-debt-management');

      // Should NOT have clinical permissions
      expect(cashier?.defaultPermissions).not.toContain('prescribe-medication');
      expect(cashier?.defaultPermissions).not.toContain('create-encounter');

      // Should NOT have dangerous financial permissions
      expect(cashier?.defaultPermissions).not.toContain('void-invoice');
      expect(cashier?.defaultPermissions).not.toContain('refund-payment');
    });

    it('viewAdmin template should have read-only access', () => {
      const templates = getRoleTemplates();
      const viewAdmin = templates.find((t) => t.code === 'viewAdmin');

      expect(viewAdmin?.departmentScoped).toBe(false);

      // Should have view permissions
      expect(viewAdmin?.defaultPermissions).toContain('view-patient-demographics');
      expect(viewAdmin?.defaultPermissions).toContain('view-encounters');
      expect(viewAdmin?.defaultPermissions).toContain('view-invoices');
      expect(viewAdmin?.defaultPermissions).toContain('view-audit-logs');

      // Should NOT have any write permissions
      expect(viewAdmin?.defaultPermissions).not.toContain('edit-patient-demographics');
      expect(viewAdmin?.defaultPermissions).not.toContain('create-encounter');
      expect(viewAdmin?.defaultPermissions).not.toContain('process-payment');
      expect(viewAdmin?.defaultPermissions).not.toContain('create-user');
    });
  });

  describe('getRoleTemplateByCode', () => {
    it('should return the correct template by code', () => {
      const template = getRoleTemplateByCode('physician');

      expect(template).toBeDefined();
      expect(template?.code).toBe('physician');
      expect(template?.name).toBe('Physician');
    });

    it('should return undefined for non-existent code', () => {
      const template = getRoleTemplateByCode('non-existent-role');

      expect(template).toBeUndefined();
    });

    it('should support language parameter', () => {
      const templateKa = getRoleTemplateByCode('physician', 'ka');
      const templateEn = getRoleTemplateByCode('physician', 'en');
      const templateRu = getRoleTemplateByCode('physician', 'ru');

      expect(templateKa?.name).toBe('ექიმი');
      expect(templateEn?.name).toBe('Physician');
      expect(templateRu?.name).toBe('Врач');
    });
  });

  describe('department scoping', () => {
    it('should have correct department scoping for each role', () => {
      const templates = getRoleTemplates();

      // Department-scoped roles
      const departmentScoped = templates.filter((t) => t.departmentScoped);
      const departmentCodes = departmentScoped.map((t) => t.code);

      expect(departmentCodes).toContain('physician');
      expect(departmentCodes).toContain('nurse');
      expect(departmentCodes).toContain('laboratory');
      expect(departmentCodes).toContain('seniorNurse');
      expect(departmentCodes).toContain('pharmacyManager');
      expect(departmentCodes).toContain('manager');
      expect(departmentCodes).toContain('technician');

      // Non-department-scoped roles
      const nonDepartmentScoped = templates.filter((t) => !t.departmentScoped);
      const nonDepartmentCodes = nonDepartmentScoped.map((t) => t.code);

      expect(nonDepartmentCodes).toContain('owner');
      expect(nonDepartmentCodes).toContain('admin');
      expect(nonDepartmentCodes).toContain('registrar');
      expect(nonDepartmentCodes).toContain('cashier');
      expect(nonDepartmentCodes).toContain('hrManager');
      expect(nonDepartmentCodes).toContain('viewAdmin');
      expect(nonDepartmentCodes).toContain('accounting');
      expect(nonDepartmentCodes).toContain('operator');
      expect(nonDepartmentCodes).toContain('externalOrg');
    });
  });

  describe('default landing pages', () => {
    it('should have appropriate default pages for each role', () => {
      const templates = getRoleTemplates();

      expect(templates.find((t) => t.code === 'owner')?.defaultPage).toBe('/emr/administration');
      expect(templates.find((t) => t.code === 'admin')?.defaultPage).toBe('/emr/administration');
      expect(templates.find((t) => t.code === 'physician')?.defaultPage).toBe('/emr/patient-history');
      expect(templates.find((t) => t.code === 'registrar')?.defaultPage).toBe('/emr/registration');
      expect(templates.find((t) => t.code === 'laboratory')?.defaultPage).toBe('/emr/nomenclature/laboratory');
      expect(templates.find((t) => t.code === 'hrManager')?.defaultPage).toBe('/emr/account-management');
    });
  });
});
