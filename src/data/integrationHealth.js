export const HEALTH_STATUSES = ['HEALTHY', 'WARNING', 'ERROR', 'DISCONNECTED']

export const initialIntegrationHealth = [
  { id: 'ih_openai', name: 'OpenAI', status: 'HEALTHY', lastCheck: '1 minute ago', latencyMs: 180, errors: 0 },
  { id: 'ih_crm', name: 'CRM', status: 'WARNING', lastCheck: '2 minutes ago', latencyMs: 420, errors: 12 },
  { id: 'ih_facebook', name: 'Facebook', status: 'HEALTHY', lastCheck: '3 minutes ago', latencyMs: 210, errors: 1 },
  { id: 'ih_instagram', name: 'Instagram', status: 'HEALTHY', lastCheck: '3 minutes ago', latencyMs: 195, errors: 0 },
  { id: 'ih_whatsapp', name: 'WhatsApp', status: 'HEALTHY', lastCheck: '4 minutes ago', latencyMs: 160, errors: 0 },
  { id: 'ih_tiktok', name: 'TikTok', status: 'WARNING', lastCheck: '5 minutes ago', latencyMs: 610, errors: 3 },
  { id: 'ih_youtube', name: 'YouTube', status: 'HEALTHY', lastCheck: '6 minutes ago', latencyMs: 240, errors: 0 },
  { id: 'ih_x', name: 'X', status: 'DISCONNECTED', lastCheck: '1 day ago', latencyMs: 0, errors: 8 },
  { id: 'ih_whatnot', name: 'Whatnot', status: 'ERROR', lastCheck: '20 minutes ago', latencyMs: 1200, errors: 5 },
  { id: 'ih_storage', name: 'Storage', status: 'HEALTHY', lastCheck: '1 minute ago', latencyMs: 45, errors: 0 },
  { id: 'ih_notifications', name: 'Notifications', status: 'HEALTHY', lastCheck: '1 minute ago', latencyMs: 70, errors: 0 },
]
