export const ROLES = {
  USER: 'user',
  ADMIN: 'admin',
};

export const PERMISSIONS = {
  ACCESS_DASHBOARD: [ROLES.USER, ROLES.ADMIN],
  ACCESS_TOOLS: [ROLES.USER, ROLES.ADMIN],
  ACCESS_HISTORY: [ROLES.USER, ROLES.ADMIN],
  ACCESS_PROFILE: [ROLES.USER, ROLES.ADMIN],
  MANAGE_SYSTEM: [ROLES.ADMIN],
  MANAGE_USERS: [ROLES.ADMIN],
};

export function hasPermission(userRole, requiredRoles) {
  if (!requiredRoles || requiredRoles.length === 0) return true;
  if (!userRole) return false;
  return requiredRoles.includes(userRole);
}
