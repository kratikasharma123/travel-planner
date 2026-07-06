export const ADMIN_ROLES = ['super_admin', 'admin', 'moderator', 'support'];

export const ADMIN_ROLE_LABELS = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  moderator: 'Moderator',
  support: 'Support',
  user: 'User',
};

export const ADMIN_ROLE_LEVELS = {
  support: 1,
  moderator: 2,
  admin: 3,
  super_admin: 4,
};

export const ADMIN_PERMISSIONS = {
  DASHBOARD_READ: 'dashboard:read',
  USERS_READ: 'users:read',
  USERS_WRITE: 'users:write',
  USERS_DELETE: 'users:delete',
  TRIPS_READ: 'trips:read',
  TRIPS_WRITE: 'trips:write',
  BOOKINGS_READ: 'bookings:read',
  BOOKINGS_WRITE: 'bookings:write',
  AI_READ: 'ai:read',
  AI_WRITE: 'ai:write',
  CONTENT_READ: 'content:read',
  CONTENT_WRITE: 'content:write',
  REPORTS_READ: 'reports:read',
  NOTIFICATIONS_READ: 'notifications:read',
  NOTIFICATIONS_WRITE: 'notifications:write',
  SUPPORT_READ: 'support:read',
  SUPPORT_WRITE: 'support:write',
  REVIEWS_READ: 'reviews:read',
  REVIEWS_WRITE: 'reviews:write',
  SETTINGS_READ: 'settings:read',
  SETTINGS_WRITE: 'settings:write',
  AUDIT_READ: 'audit:read',
};

export const ROLE_PERMISSIONS = {
  support: [
    ADMIN_PERMISSIONS.DASHBOARD_READ,
    ADMIN_PERMISSIONS.USERS_READ,
    ADMIN_PERMISSIONS.SUPPORT_READ,
    ADMIN_PERMISSIONS.SUPPORT_WRITE,
    ADMIN_PERMISSIONS.REVIEWS_READ,
  ],
  moderator: [
    ADMIN_PERMISSIONS.DASHBOARD_READ,
    ADMIN_PERMISSIONS.USERS_READ,
    ADMIN_PERMISSIONS.TRIPS_READ,
    ADMIN_PERMISSIONS.BOOKINGS_READ,
    ADMIN_PERMISSIONS.CONTENT_READ,
    ADMIN_PERMISSIONS.CONTENT_WRITE,
    ADMIN_PERMISSIONS.SUPPORT_READ,
    ADMIN_PERMISSIONS.SUPPORT_WRITE,
    ADMIN_PERMISSIONS.REVIEWS_READ,
    ADMIN_PERMISSIONS.REVIEWS_WRITE,
    ADMIN_PERMISSIONS.REPORTS_READ,
  ],
  admin: [
    ADMIN_PERMISSIONS.DASHBOARD_READ,
    ADMIN_PERMISSIONS.USERS_READ,
    ADMIN_PERMISSIONS.USERS_WRITE,
    ADMIN_PERMISSIONS.TRIPS_READ,
    ADMIN_PERMISSIONS.TRIPS_WRITE,
    ADMIN_PERMISSIONS.BOOKINGS_READ,
    ADMIN_PERMISSIONS.BOOKINGS_WRITE,
    ADMIN_PERMISSIONS.AI_READ,
    ADMIN_PERMISSIONS.AI_WRITE,
    ADMIN_PERMISSIONS.CONTENT_READ,
    ADMIN_PERMISSIONS.CONTENT_WRITE,
    ADMIN_PERMISSIONS.REPORTS_READ,
    ADMIN_PERMISSIONS.NOTIFICATIONS_READ,
    ADMIN_PERMISSIONS.NOTIFICATIONS_WRITE,
    ADMIN_PERMISSIONS.SUPPORT_READ,
    ADMIN_PERMISSIONS.SUPPORT_WRITE,
    ADMIN_PERMISSIONS.REVIEWS_READ,
    ADMIN_PERMISSIONS.REVIEWS_WRITE,
    ADMIN_PERMISSIONS.SETTINGS_READ,
  ],
  super_admin: Object.values(ADMIN_PERMISSIONS),
};

export const ADMIN_TABS = [
  { key: 'overview', label: 'Overview', permission: ADMIN_PERMISSIONS.DASHBOARD_READ },
  { key: 'users', label: 'Users', permission: ADMIN_PERMISSIONS.USERS_READ },
  { key: 'trips', label: 'Trips', permission: ADMIN_PERMISSIONS.TRIPS_READ },
  { key: 'bookings', label: 'Bookings', permission: ADMIN_PERMISSIONS.BOOKINGS_READ },
  { key: 'ai', label: 'AI Usage', permission: ADMIN_PERMISSIONS.AI_READ },
  { key: 'content', label: 'Content', permission: ADMIN_PERMISSIONS.CONTENT_READ },
  { key: 'audit', label: 'Audit Logs', permission: ADMIN_PERMISSIONS.AUDIT_READ },
];

export const ACTIVE_ADMIN_STATUSES = ['active'];
export const USER_STATUSES = ['active', 'suspended', 'disabled'];

export function isAdminRole(role) {
  return ADMIN_ROLES.includes(role);
}

export function canAccessAdmin(user) {
  return isAdminRole(user?.role) && ACTIVE_ADMIN_STATUSES.includes(user?.status || 'active');
}

export function canChooseAdminDashboard(user) {
  return ['admin', 'super_admin'].includes(user?.role) && ACTIVE_ADMIN_STATUSES.includes(user?.status || 'active');
}

export function hasAdminPermission(user, permission) {
  if (!canAccessAdmin(user)) return false;
  const rolePermissions = ROLE_PERMISSIONS[user.role] || [];
  const explicitPermissions = user.permissions || user.adminPermissions || {};

  if (explicitPermissions[permission] === false) return false;
  if (explicitPermissions[permission] === true) return true;
  return rolePermissions.includes(permission);
}

export function canManageRole(actor, targetRole) {
  if (!canAccessAdmin(actor)) return false;
  if (actor.role === 'super_admin') return true;
  return (ADMIN_ROLE_LEVELS[actor.role] || 0) > (ADMIN_ROLE_LEVELS[targetRole] || 0);
}

export function getVisibleAdminTabs(user) {
  return ADMIN_TABS.filter((tab) => hasAdminPermission(user, tab.permission));
}
