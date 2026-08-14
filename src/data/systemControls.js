export const initialSystemControls = {
  salesperson: {
    salespersonAvailability: true,
    leadDispatch: true,
    automaticRouting: true,
    afterHoursRouting: true,
  },
  dealership: {
    dealershipAutomation: true,
    aiConversations: true,
    leadQualification: true,
    crmSync: true,
    appointmentAutomation: true,
  },
  social: {
    socialPosting: true,
    scheduledPosts: true,
    autoPublishing: false,
    aiContentPublishing: true,
  },
  autonomy: {
    aiAutonomy: true,
    automaticLeadRouting: true,
    automaticFollowUp: true,
    automaticAppointmentAssistance: true,
    automaticCrmSync: true,
    automaticMarketingPublishing: false,
  },
}

export const controlLabels = {
  salespersonAvailability: 'Salesperson Availability',
  leadDispatch: 'Lead Dispatch',
  automaticRouting: 'Automatic Routing',
  afterHoursRouting: 'After-Hours Routing',
  dealershipAutomation: 'Dealership Automation',
  aiConversations: 'AI Conversations',
  leadQualification: 'Lead Qualification',
  crmSync: 'CRM Sync',
  appointmentAutomation: 'Appointment Automation',
  socialPosting: 'Social Posting',
  scheduledPosts: 'Scheduled Posts',
  autoPublishing: 'Auto Publishing',
  aiContentPublishing: 'AI Content Publishing',
  aiAutonomy: 'AI Autonomy',
  automaticLeadRouting: 'Automatic Lead Routing',
  automaticFollowUp: 'Automatic Follow-Up',
  automaticAppointmentAssistance: 'Automatic Appointment Assistance',
  automaticCrmSync: 'Automatic CRM Sync',
  automaticMarketingPublishing: 'Automatic Marketing Publishing',
}

export const criticalControls = new Set([
  'automaticRouting',
  'automaticLeadRouting',
  'leadDispatch',
  'aiConversations',
  'crmSync',
  'automaticCrmSync',
  'aiAutonomy',
])
