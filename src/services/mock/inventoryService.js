import { delay } from '../../utils/delay'
import {
  inventoryStats,
  inventorySignals,
  initialInventory,
} from '../../data/inventory'

let inventory = structuredClone(initialInventory)

export async function getInventoryStats() {
  await delay(220)
  return { ...inventoryStats }
}

export async function getInventorySignals() {
  await delay(200)
  return structuredClone(inventorySignals)
}

export async function getInventory() {
  await delay(300)
  return structuredClone(inventory)
}

export async function getInventoryById(id) {
  await delay(250)
  const item = inventory.find((v) => v.id === id)
  return item ? structuredClone(item) : null
}

const inventoryService = {
  getInventoryStats,
  getInventorySignals,
  getInventory,
  getInventoryById,
}

export default inventoryService
