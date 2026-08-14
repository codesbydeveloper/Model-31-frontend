import { delay } from '../../utils/delay'
import { initialPlatformUsers } from '../../data/platformUsers'

let users = structuredClone(initialPlatformUsers)

function nextId() {
  return `pu_${String(Date.now()).slice(-6)}`
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

export async function getUsers() {
  await delay(300)
  return structuredClone(users)
}

export async function createUser(payload) {
  await delay(650)
  const created = {
    id: nextId(),
    name: payload.name,
    email: payload.email,
    role: payload.role,
    dealership: payload.dealership || 'Unassigned',
    phone: payload.phone || '',
    status: payload.status || 'Active',
    lastActive: 'Just now',
    createdDate: today(),
  }
  users = [created, ...users]
  return structuredClone(created)
}

export async function updateUser(id, payload) {
  await delay(600)
  const index = users.findIndex((u) => u.id === id)
  if (index === -1) throw new Error('User not found')
  users[index] = { ...users[index], ...payload, id }
  return structuredClone(users[index])
}

export async function deleteUser(id) {
  await delay(500)
  users = users.filter((u) => u.id !== id)
  return true
}

const userService = {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
}

export default userService
