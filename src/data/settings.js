export const initialPlatformSettings = {
  general: {
    platformName: 'Model 31',
    timezone: 'America/New_York',
    defaultLanguage: 'English',
  },
  notifications: {
    emailNotifications: true,
    leadAlerts: true,
    systemAlerts: true,
    crmAlerts: true,
  },
  system: {
    aiConversation: true,
    leadQualification: true,
    leadDispatch: true,
    socialPosting: true,
    crmSync: true,
    systemAutonomy: true,
  },
}

export const TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Phoenix',
]

export const LANGUAGES = ['English', 'Spanish', 'English / Spanish']
