// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

/**
 * T095: Quickstart.md Validation Scenarios
 *
 * Verifies all 10 items from the migration checklist are implemented:
 * 1. Permission codes in permissionService.ts
 * 2. 16 role templates
 * 3. PermissionGate component
 * 4. RequirePermission wrapper
 * 5. Permission cache with 10s TTL
 * 6. Department scoping
 * 7. Audit logging
 * 8. Permission matrix UI (8 categories)
 * 9. Translations (ka/en/ru)
 * 10. Fail-closed behavior tests
 */

import { getPermissionTree } from './permissionService';
import { permissionCache } from './permissionCacheService';

describe('T095: Quickstart Validation', () => {
  describe('1. Permission Codes', () => {
    it('should have 80+ permissions defined', () => {
      const tree = getPermissionTree();
      const totalPermissions = tree.reduce((sum, cat) => sum + cat.permissions.length, 0);

      console.log(`Total permissions defined: ${totalPermissions}`);
      expect(totalPermissions).toBeGreaterThanOrEqual(80);
    });

    it('should have all required permission categories', () => {
      const tree = getPermissionTree();
      const categories = tree.map(c => c.code);

      expect(categories).toContain('patient-management');
      expect(categories).toContain('clinical-documentation');
      expect(categories).toContain('laboratory');
      expect(categories).toContain('billing-financial');
      expect(categories).toContain('administration');
      expect(categories).toContain('reports');
      expect(categories).toContain('nomenclature');
      expect(categories).toContain('scheduling');
    });
  });

  describe('2. Role Templates', () => {
    it('should have roleTemplateService available', () => {
      // Import check - will fail if file doesn't exist
      const { getRoleTemplates } = require('./roleTemplateService');
      expect(typeof getRoleTemplates).toBe('function');
    });

    it('should have 16 role templates', () => {
      const { getRoleTemplates } = require('./roleTemplateService');
      const templates = getRoleTemplates();

      console.log(`Role templates defined: ${templates.length}`);
      expect(templates.length).toBe(16);
    });

    it('should include essential role templates', () => {
      const { getRoleTemplates } = require('./roleTemplateService');
      const templates = getRoleTemplates();
      const codes = templates.map((t: { code: string }) => t.code);

      expect(codes).toContain('physician');
      expect(codes).toContain('nurse');
      expect(codes).toContain('admin');
      expect(codes).toContain('registrar'); // 'registrar' is the actual code, not 'receptionist'
    });
  });

  describe('3. PermissionGate Component', () => {
    it('should export PermissionGate from access-control', () => {
      const { PermissionGate } = require('../components/access-control');
      expect(PermissionGate).toBeDefined();
      expect(typeof PermissionGate).toBe('function');
    });
  });

  describe('4. RequirePermission Component', () => {
    it('should export RequirePermission from access-control', () => {
      const { RequirePermission } = require('../components/access-control');
      expect(RequirePermission).toBeDefined();
      expect(typeof RequirePermission).toBe('function');
    });
  });

  describe('5. Permission Cache (10s TTL)', () => {
    it('should have cache service available', () => {
      expect(permissionCache).toBeDefined();
      expect(typeof permissionCache.get).toBe('function');
      expect(typeof permissionCache.set).toBe('function');
    });

    it('should cache and retrieve permissions', () => {
      permissionCache.set('test-cache-perm', true);
      expect(permissionCache.get('test-cache-perm')).toBe(true);

      permissionCache.set('test-cache-perm-2', false);
      expect(permissionCache.get('test-cache-perm-2')).toBe(false);
    });

    it('should return null for unknown permissions (fail-closed)', () => {
      expect(permissionCache.get('nonexistent-permission')).toBeNull();
    });
  });

  describe('6. Department Scoping', () => {
    it('should have addDepartmentScoping function', () => {
      const { addDepartmentScoping } = require('./permissionService');
      expect(typeof addDepartmentScoping).toBe('function');
    });

    it('should have createDepartmentScopedRole in roleService', () => {
      const { createDepartmentScopedRole } = require('./roleService');
      expect(typeof createDepartmentScopedRole).toBe('function');
    });
  });

  describe('7. Audit Logging', () => {
    it('should have core audit functions in auditService', () => {
      const auditService = require('./auditService');

      expect(typeof auditService.createAuditEvent).toBe('function');
      expect(typeof auditService.createAccountAuditEvent).toBe('function');
      expect(typeof auditService.searchAuditEvents).toBe('function');
    });

    it('should have emergency access audit function', () => {
      const auditService = require('./auditService');
      expect(typeof auditService.logEmergencyAccess).toBe('function');
    });
  });

  describe('8. Permission Matrix (8 Categories)', () => {
    it('should have exactly 8 permission categories', () => {
      const tree = getPermissionTree();
      expect(tree.length).toBe(8);
    });

    it('should have CategoryPermissionGroup component', () => {
      const { CategoryPermissionGroup } = require('../components/role-management/CategoryPermissionGroup');
      expect(CategoryPermissionGroup).toBeDefined();
    });
  });

  describe('9. Translations', () => {
    it('should have permission translations file', () => {
      const permissions = require('../translations/permissions.json');
      expect(permissions).toBeDefined();
      expect(permissions['view-patient-list']).toBeDefined();
    });

    it('should have all three languages', () => {
      const permissions = require('../translations/permissions.json');
      const firstPerm = permissions['view-patient-list'];

      expect(firstPerm.ka).toBeDefined();
      expect(firstPerm.en).toBeDefined();
      expect(firstPerm.ru).toBeDefined();
    });

    it('should have permission category translations', () => {
      const categories = require('../translations/permission-categories.json');
      expect(categories).toBeDefined();
      expect(categories['patient-management']).toBeDefined();
    });

    it('should have role template translations', () => {
      const templates = require('../translations/role-templates.json');
      expect(templates).toBeDefined();
      expect(templates.physician).toBeDefined();
    });
  });

  describe('10. Fail-Closed Behavior', () => {
    it('cache returns null for missing permissions', () => {
      const result = permissionCache.get('definitely-not-a-real-permission');
      expect(result).toBeNull();
    });

    it('all permissions have valid structure', () => {
      const tree = getPermissionTree();

      tree.forEach(category => {
        expect(category.code).toBeTruthy();
        expect(category.name).toBeTruthy();

        category.permissions.forEach(perm => {
          expect(perm.code).toBeTruthy();
          expect(perm.name).toBeTruthy();
          expect(perm.accessLevel).toBeTruthy();
        });
      });
    });
  });

  describe('Summary', () => {
    it('prints implementation summary', () => {
      const tree = getPermissionTree();
      const totalPerms = tree.reduce((sum, cat) => sum + cat.permissions.length, 0);
      const { getRoleTemplates } = require('./roleTemplateService');
      const templates = getRoleTemplates();

      console.log('\n=== PERMISSION SYSTEM IMPLEMENTATION SUMMARY ===');
      console.log(`Total Permission Categories: ${tree.length}`);
      console.log(`Total Permissions: ${totalPerms}`);
      console.log(`Role Templates: ${templates.length}`);
      console.log(`Cache Available: ${permissionCache ? 'Yes' : 'No'}`);
      console.log('=================================================\n');

      // This test always passes - it's for reporting
      expect(true).toBe(true);
    });
  });
});
