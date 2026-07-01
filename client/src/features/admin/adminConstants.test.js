import {
  ADMIN_PERMISSIONS,
  canAccessAdmin,
  canChooseAdminDashboard,
  hasAdminPermission,
} from './adminConstants.js';

describe('adminConstants RBAC helpers', () => {
  it('allows active admin roles to access admin', () => {
    expect(canAccessAdmin({ role: 'admin', status: 'active' })).toBe(true);
    expect(canAccessAdmin({ role: 'support', status: 'active' })).toBe(true);
  });

  it('denies normal and suspended users', () => {
    expect(canAccessAdmin({ role: 'user', status: 'active' })).toBe(false);
    expect(canAccessAdmin({ role: 'admin', status: 'suspended' })).toBe(false);
  });

  it('shows chooser only for admin and super admin credentials', () => {
    expect(canChooseAdminDashboard({ role: 'super_admin', status: 'active' })).toBe(true);
    expect(canChooseAdminDashboard({ role: 'admin', status: 'active' })).toBe(true);
    expect(canChooseAdminDashboard({ role: 'support', status: 'active' })).toBe(false);
    expect(canChooseAdminDashboard({ role: 'user', status: 'active' })).toBe(false);
    expect(canChooseAdminDashboard({ role: 'admin', status: 'suspended' })).toBe(false);
  });

  it('checks role and explicit permissions', () => {
    expect(
      hasAdminPermission({ role: 'support', status: 'active' }, ADMIN_PERMISSIONS.SUPPORT_WRITE)
    ).toBe(true);
    expect(
      hasAdminPermission({ role: 'support', status: 'active' }, ADMIN_PERMISSIONS.SETTINGS_WRITE)
    ).toBe(false);
    expect(
      hasAdminPermission(
        {
          role: 'support',
          status: 'active',
          permissions: { [ADMIN_PERMISSIONS.SETTINGS_WRITE]: true },
        },
        ADMIN_PERMISSIONS.SETTINGS_WRITE
      )
    ).toBe(true);
    expect(
      hasAdminPermission(
        {
          role: 'super_admin',
          status: 'active',
          permissions: { [ADMIN_PERMISSIONS.AUDIT_READ]: false },
        },
        ADMIN_PERMISSIONS.AUDIT_READ
      )
    ).toBe(false);
  });
});
