import { delay } from '../../utils/delay'
import { initialCommunities } from '../../data/communities'

let communities = structuredClone(initialCommunities)

export async function getCommunities() {
  await delay(300)
  return structuredClone(communities)
}

export async function getCommunityDetails(id) {
  await delay(250)
  const item = communities.find((c) => c.id === id)
  return item ? structuredClone(item) : null
}

const communityService = {
  getCommunities,
  getCommunityDetails,
}

export default communityService
