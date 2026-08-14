import { delay } from '../../utils/delay'
import {
  attributionFunnel,
  initialAttributionRows,
} from '../../data/attribution'

export async function getAttributionData() {
  await delay(300)
  return {
    funnel: structuredClone(attributionFunnel),
    rows: structuredClone(initialAttributionRows),
  }
}

const attributionService = {
  getAttributionData,
}

export default attributionService
