import { delay } from '../../utils/delay'
import { initialVehicleVisualPackages } from '../../data/vehicleVisualPackages'

const packages = structuredClone(initialVehicleVisualPackages)

export async function getVehicleVisualPackage(leadId) {
  await delay(200)
  const item = packages.find((row) => row.leadId === leadId)
  return item ? structuredClone(item) : null
}

export async function getVehicleVisualPackages() {
  await delay(220)
  return structuredClone(packages)
}

const visualPackageService = {
  getVehicleVisualPackage,
  getVehicleVisualPackages,
}

export default visualPackageService
