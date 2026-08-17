const NUCLEAR_KEY = 'autoflow_nuclear_mode'

export const nuclearModeStats = {
  activeDeals: 12,
  qualifiedBuyers: 38,
  managerHandoffs: 7,
  dealsReady: 4,
}

export function readNuclearModeEnabled() {
  try {
    return localStorage.getItem(NUCLEAR_KEY) === 'ON'
  } catch {
    return false
  }
}

export function writeNuclearModeEnabled(enabled) {
  try {
    localStorage.setItem(NUCLEAR_KEY, enabled ? 'ON' : 'OFF')
  } catch {
    // ignore
  }
}

export const nuclearModeCopy = {
  off: 'Model 31 operates in standard assist mode.',
  on: 'Model 31 may assist with advanced deal guidance within manager-defined limits.',
}
