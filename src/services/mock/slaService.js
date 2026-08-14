import { delay } from '../../utils/delay'
import { initialSlaRows, slaChart, slaOverview } from '../../data/sla'

let rows = structuredClone(initialSlaRows)

export async function getSLAData() {
  await delay(320)
  return {
    overview: { ...slaOverview },
    chart: structuredClone(slaChart),
    rows: structuredClone(rows),
  }
}

const slaService = {
  getSLAData,
}

export default slaService
