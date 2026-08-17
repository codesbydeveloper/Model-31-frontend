import { delay } from '../../utils/delay'
import {
  nuclearModeStats,
  nuclearModeCopy,
  readNuclearModeEnabled,
  writeNuclearModeEnabled,
} from '../../data/nuclearMode'

export async function getNuclearMode() {
  await delay(180)
  const enabled = readNuclearModeEnabled()
  return {
    enabled,
    status: enabled ? 'ON' : 'OFF',
    description: enabled ? nuclearModeCopy.on : nuclearModeCopy.off,
    ...nuclearModeStats,
  }
}

export async function setNuclearMode(enabled) {
  await delay(400)
  writeNuclearModeEnabled(Boolean(enabled))
  return getNuclearMode()
}

const nuclearModeService = {
  getNuclearMode,
  setNuclearMode,
}

export default nuclearModeService
