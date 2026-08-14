import { findUserByCredentials, sanitizeUser } from '../../data/users'

const AUTH_DELAY_MS = 700

function delay(ms = AUTH_DELAY_MS) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Frontend-only mock authentication.
 * Real backend auth will replace this in a later step.
 */
export async function mockLogin(email, password) {
  await delay()

  const user = findUserByCredentials(email, password)

  if (!user) {
    return {
      success: false,
      error: 'Invalid email or password.',
    }
  }

  if (user.status !== 'active') {
    return {
      success: false,
      error: 'This account is inactive.',
    }
  }

  return {
    success: true,
    user: sanitizeUser(user),
  }
}

export default {
  mockLogin,
}
