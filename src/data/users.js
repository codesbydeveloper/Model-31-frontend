import { ROLES } from './roles'

export const DEMO_PASSWORD = 'Demo@123'

export const users = [
  {
    id: 'usr_super_admin',
    name: 'Alex Rivera',
    email: 'superadmin@autoflow.com',
    password: DEMO_PASSWORD,
    role: ROLES.SUPER_ADMIN,
    avatar: 'AR',
    status: 'active',
    dealership: 'AutoFlow Corporate',
  },
  {
    id: 'usr_dealer_admin',
    name: 'Jordan Blake',
    email: 'dealeradmin@autoflow.com',
    password: DEMO_PASSWORD,
    role: ROLES.DEALERSHIP_ADMIN,
    avatar: 'JB',
    status: 'active',
    dealership: 'Miami Luxury Motors',
  },
  {
    id: 'usr_bdc_manager',
    name: 'Casey Morgan',
    email: 'bdcmanager@autoflow.com',
    password: DEMO_PASSWORD,
    role: ROLES.BDC_MANAGER,
    avatar: 'CM',
    status: 'active',
    dealership: 'Miami Luxury Motors',
  },
  {
    id: 'usr_salesperson',
    name: 'John Smith',
    email: 'salesperson@autoflow.com',
    password: DEMO_PASSWORD,
    role: ROLES.SALESPERSON,
    avatar: 'JS',
    status: 'active',
    dealership: 'Miami Luxury Motors',
    salespersonId: 'sp_001',
  },
  {
    id: 'usr_marketing',
    name: 'Taylor Quinn',
    email: 'marketing@autoflow.com',
    password: DEMO_PASSWORD,
    role: ROLES.MARKETING_MANAGER,
    avatar: 'TQ',
    status: 'active',
    dealership: 'Miami Luxury Motors',
  },
]

export function findUserByCredentials(email, password) {
  const normalizedEmail = email.trim().toLowerCase()
  return users.find(
    (user) =>
      user.email.toLowerCase() === normalizedEmail &&
      user.password === password,
  )
}

export function sanitizeUser(user) {
  if (!user) return null
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    status: user.status,
    dealership: user.dealership,
    salespersonId: user.salespersonId || null,
  }
}
