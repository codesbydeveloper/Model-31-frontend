export const ROLES = {
  SUPER_ADMIN: 'Super Admin',
  DEALERSHIP_ADMIN: 'Dealership Admin',
  BDC_MANAGER: 'BDC Manager',
  SALESPERSON: 'Salesperson',
  MARKETING_MANAGER: 'Marketing Manager',
}

export const ROLE_DASHBOARD_PATHS = {
  [ROLES.SUPER_ADMIN]: '/super-admin/dashboard',
  [ROLES.DEALERSHIP_ADMIN]: '/dealership/dashboard',
  [ROLES.BDC_MANAGER]: '/bdc/dashboard',
  [ROLES.SALESPERSON]: '/salesperson/dashboard',
  [ROLES.MARKETING_MANAGER]: '/marketing/dashboard',
}

export function getDashboardPathForRole(role) {
  return ROLE_DASHBOARD_PATHS[role] || '/login'
}

const ROLE_ALIASES = {
  SUPER_ADMIN: ROLES.SUPER_ADMIN,
  DEALERSHIP_ADMIN: ROLES.DEALERSHIP_ADMIN,
  DEALER_ADMIN: ROLES.DEALERSHIP_ADMIN,
  BDC_MANAGER: ROLES.BDC_MANAGER,
  SALESPERSON: ROLES.SALESPERSON,
  SALES_PERSON: ROLES.SALESPERSON,
  MARKETING_MANAGER: ROLES.MARKETING_MANAGER,
}

export function normalizeRole(role) {
  if (!role) return ''
  if (ROLE_DASHBOARD_PATHS[role]) return role
  const key = String(role).trim().toUpperCase().replace(/[\s-]+/g, '_')
  return ROLE_ALIASES[key] || role
}
