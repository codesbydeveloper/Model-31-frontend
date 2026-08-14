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
