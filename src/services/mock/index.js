/**
 * Mock service foundation for AutoFlow.
 * Real API calls will be added in later steps.
 */

export { mockLogin } from './authService'
export { default as authService } from './authService'
export { default as dealershipService } from './dealershipService'
export { default as cityService } from './cityService'
export { default as personaService } from './personaService'
export { default as userService } from './userService'
export { default as nuclearModeService } from './nuclearModeService'
export { default as buyerGenomeService } from './buyerGenomeService'
export { default as negotiationService } from './negotiationService'
export { default as dealHandoffService } from './dealHandoffService'
export { default as visualPackageService } from './visualPackageService'
export { default as commandCenterService } from './commandCenterService'
export { default as analyticsService } from './analyticsService'
export { default as integrationService } from './integrationService'
export { default as settingsService } from './settingsService'
export { default as leadService } from './leadService'
export { default as conversationService } from './conversationService'
export { default as salespersonService } from './salespersonService'
export { default as bdcService } from './bdcService'
export { default as dispatchService } from './dispatchService'
export { default as slaService } from './slaService'
export { default as escalationService } from './escalationService'
export { default as appointmentService } from './appointmentService'
export { default as commissionService } from './commissionService'
export { soldDealService } from './soldDealService'
export { default as marketingContentService } from './marketingContentService'
export { default as campaignService } from './campaignService'
export { default as socialService } from './socialService'
export { default as scheduledPostService } from './scheduledPostService'
export { default as marketingAnalyticsService } from './marketingAnalyticsService'
export { default as attributionService } from './attributionService'
export { default as crmService } from './crmService'
export { default as customerIdentityService } from './customerIdentityService'
export { default as inventoryService } from './inventoryService'
export { default as platformAnalyticsService } from './platformAnalyticsService'
export { default as systemControlService } from './systemControlService'
export { default as eventService } from './eventService'
export { default as integrationHealthService } from './integrationHealthService'
export { default as notificationService } from './notificationService'

export const mockStatus = {
  frontend: 'ready',
  backend: 'not_connected',
  database: 'not_connected',
  integrations: 'not_connected',
}

export async function getFoundationStatus() {
  return Promise.resolve({ ...mockStatus })
}

const mockService = {
  getFoundationStatus,
  mockStatus,
}

export default mockService
