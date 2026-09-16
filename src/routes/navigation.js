import {
  LayoutDashboard,
  Building2,
  MapPinned,
  UsersRound,
  Bot,
  Gauge,
  Users,
  Cable,
  Share2,
  BarChart3,
  Settings,
  UserRound,
  LogOut,
  MessageSquare,
  UserCheck,
  FileText,
  ClipboardList,
  ListOrdered,
  Timer,
  TrendingUp,
  AlertTriangle,
  Inbox,
  Contact,
  CalendarCheck,
  Handshake,
  Wallet,
  Sparkles,
  CheckSquare,
  CalendarClock,
  Target,
  PieChart,
  Link2,
  Fingerprint,
  Car,
  Activity,
  HeartPulse,
  Bell,
  SlidersHorizontal,
  Radar,
  MessageCircleHeart,
  Crosshair,
  Gift,
  CalendarHeart,
  Network,
  Globe2,
  Split,
  Workflow,
  Scale,
  FileStack,
  ClipboardCheck,
} from 'lucide-react'
import { ROLES } from '../data/roles'

/**
 * Centralized role-based navigation for Model 31.
 * Placeholder routes only — business modules come in later steps.
 */

export const SIDEBAR_COLLAPSED_KEY = 'autoflow_sidebar_collapsed'

export const FOOTER_NAV = [
  { label: 'Profile', path: '/profile', icon: UserRound },
  { label: 'Settings', pathKey: 'settings', icon: Settings },
  { label: 'Logout', action: 'logout', icon: LogOut },
]

export const ROLE_NAVIGATION = {
  [ROLES.SUPER_ADMIN]: [
    {
      label: 'Dashboard',
      path: '/super-admin/dashboard',
      icon: LayoutDashboard,
      title: 'Model 31 Command Center',
      subtitle: 'Model 31 Command Center',
      description: 'Unified lead operations, dispatch, fingerprints, BDC inbox, rooftop performance, social engine, CRM sync, and underwater rescue.',
    },
    {
      label: 'Dealerships',
      path: '/super-admin/dealerships',
      icon: Building2,
      title: 'Dealerships',
      subtitle: 'Dealership Management',
      description: 'Manage dealerships across the Model 31 platform.',
    },
    {
      label: 'Leads',
      path: '/super-admin/leads',
      icon: ClipboardList,
      title: 'Leads',
      subtitle: 'Lead Management',
      description:
        'Manage, qualify and monitor customer leads across the Model 31 platform.',
    },
    {
      label: 'Cities',
      path: '/super-admin/cities',
      icon: MapPinned,
      title: 'Cities',
      subtitle: 'City Configuration',
      description: 'Configure supported cities and market regions.',
    },
    {
      label: 'Buyer Personas',
      path: '/super-admin/buyer-personas',
      icon: UsersRound,
      title: 'Buyer Personas',
      subtitle: 'Buyer Persona Library',
      description: 'Define and manage automotive buyer personas.',
    },
    {
      label: 'AI Configuration',
      path: '/super-admin/ai-configuration',
      icon: Bot,
      title: 'AI Configuration',
      subtitle: 'AI Platform Settings',
      description: 'Configure AI conversation and automation behavior.',
    },
    {
      label: 'Scoring Rules',
      path: '/super-admin/scoring-rules',
      icon: Gauge,
      title: 'Scoring Rules',
      subtitle: 'Lead Scoring Rules',
      description: 'Define lead scoring and qualification rules.',
    },
    {
      label: 'Users & Roles',
      path: '/super-admin/users',
      icon: Users,
      title: 'Users & Roles',
      subtitle: 'User & Role Management',
      description: 'Manage platform users and role assignments.',
    },
    {
      label: 'CRM Integrations',
      path: '/super-admin/crm-integrations',
      icon: Cable,
      title: 'CRM Integrations',
      subtitle:
        'Manage CRM connections, synchronization and integration health across the Model 31 platform.',
      description:
        'Manage CRM connections, synchronization and integration health across the Model 31 platform.',
    },
    {
      label: 'Customer Identity',
      path: '/super-admin/customer-identity',
      icon: Fingerprint,
      title: 'Customer Identity',
      subtitle:
        'View unified customer profiles across conversations, CRM and marketing channels.',
      description:
        'View unified customer profiles across conversations, CRM and marketing channels.',
    },
    {
      label: 'Inventory',
      path: '/super-admin/inventory',
      icon: Car,
      title: 'Inventory Intelligence',
      subtitle:
        'Monitor vehicle inventory, pricing, availability and dealership inventory signals.',
      description:
        'Monitor vehicle inventory, pricing, availability and dealership inventory signals.',
    },
    {
      label: 'Social Integrations',
      path: '/super-admin/social-integrations',
      icon: Share2,
      title: 'Social Integrations',
      subtitle: 'Social Media Integrations',
      description: 'Configure social channel integrations.',
    },
    {
      label: 'Analytics',
      path: '/super-admin/analytics',
      icon: BarChart3,
      title: 'Platform Analytics',
      subtitle:
        'Monitor platform-wide lead, sales, AI, marketing and dealership performance.',
      description:
        'Monitor platform-wide lead, sales, AI, marketing and dealership performance.',
    },
    {
      label: 'OEM Reporting',
      path: '/super-admin/oem-reporting',
      icon: ClipboardCheck,
      title: 'OEM Reporting',
      subtitle: 'Brand-level visibility for compliance and enterprise alignment.',
      description: 'Brand-level visibility for compliance and enterprise alignment.',
    },
    {
      label: 'Events',
      path: '/super-admin/events',
      icon: Activity,
      title: 'Event Monitor',
      subtitle: 'Monitor platform events and automation activity.',
      description: 'Monitor platform events and automation activity.',
    },
    {
      label: 'Integration Health',
      path: '/super-admin/integration-health',
      icon: HeartPulse,
      title: 'Integration Health',
      subtitle: 'Monitor integration health and latency.',
      description: 'Monitor integration health and latency.',
    },
    {
      label: 'Notifications',
      path: '/super-admin/notifications',
      icon: Bell,
      title: 'Platform Notifications',
      subtitle: 'System alerts and integration notifications.',
      description: 'System alerts and integration notifications.',
    },
    {
      label: 'Pipeline Transparency',
      path: '/super-admin/pipeline-transparency',
      icon: Split,
      title: 'Pipeline Transparency',
      subtitle: 'Monitor the separation between Model 31 leads and dealership leads.',
      description: 'Monitor the separation between Model 31 leads and dealership leads.',
    },
    {
      label: 'Negotiation Control',
      path: '/super-admin/negotiation-control',
      icon: Scale,
      title: 'Negotiation Control',
      subtitle: 'Define the limits Model 31 may use when advanced deal assistance is enabled.',
      description: 'Define the limits Model 31 may use when advanced deal assistance is enabled.',
    },
    {
      label: 'Negotiation Templates',
      path: '/super-admin/negotiation-templates',
      icon: FileStack,
      title: 'Negotiation Templates',
      subtitle: 'Reusable manager-defined price, payment and trade rules.',
      description: 'Reusable manager-defined price, payment and trade rules.',
    },
    {
      label: 'Deal Handoffs',
      path: '/super-admin/deal-handoffs',
      icon: Handshake,
      title: 'Deal Handoffs',
      subtitle: 'Review qualified buyers and structured deals requiring management attention.',
      description: 'Review qualified buyers and structured deals requiring management attention.',
    },
    {
      label: 'System Controls',
      path: '/super-admin/system-controls',
      icon: SlidersHorizontal,
      title: 'System Control Center',
      subtitle:
        'Control platform automation, AI behavior, dispatch, social publishing and dealership operations.',
      description:
        'Control platform automation, AI behavior, dispatch, social publishing and dealership operations.',
    },
    {
      label: 'Platform Settings',
      path: '/super-admin/settings',
      icon: Settings,
      title: 'Platform Settings',
      subtitle: 'Platform Configuration',
      description: 'Manage global Model 31 platform settings.',
      isSettings: true,
    },
  ],

  [ROLES.DEALERSHIP_ADMIN]: [
    {
      label: 'Dashboard',
      path: '/dealership/dashboard',
      icon: LayoutDashboard,
      title: 'Dashboard',
      subtitle: 'Dealership Admin Dashboard',
      description: 'Dealership operations overview.',
    },
    {
      label: 'Leads',
      path: '/dealership/leads',
      icon: ClipboardList,
      title: 'Leads',
      subtitle: 'Lead Management',
      description: 'Manage and monitor dealership leads.',
    },
    {
      label: 'Conversations',
      path: '/dealership/conversations',
      icon: MessageSquare,
      title: 'Conversations',
      subtitle: 'Customer Conversations',
      description: 'Monitor AI and team customer conversations.',
    },
    {
      label: 'Salespeople',
      path: '/dealership/salespeople',
      icon: UserCheck,
      title: 'Salespeople',
      subtitle: 'Sales Team',
      description: 'Manage salespeople and dispatch settings.',
    },
    {
      label: 'Social Accounts',
      path: '/dealership/social',
      icon: Share2,
      title: 'Social Accounts',
      subtitle: 'Social Account Management',
      description: 'Connect and manage dealership social accounts.',
    },
    {
      label: 'CRM',
      path: '/dealership/crm',
      icon: Contact,
      title: 'CRM',
      subtitle: 'CRM Sync',
      description: 'Manage CRM sync and dealership CRM settings.',
    },
    {
      label: 'AI Content',
      path: '/dealership/content',
      icon: Sparkles,
      title: 'AI Content',
      subtitle: 'AI Content Studio',
      description: 'Review and manage AI-generated marketing content.',
    },
    {
      label: 'Reports',
      path: '/dealership/reports',
      icon: FileText,
      title: 'Reports',
      subtitle: 'Dealership Reports',
      description: 'View dealership performance reports.',
    },
    {
      label: 'Settings',
      path: '/dealership/settings',
      icon: Settings,
      title: 'Settings',
      subtitle: 'Dealership Settings',
      description: 'Configure dealership preferences.',
      isSettings: true,
    },
  ],

  [ROLES.BDC_MANAGER]: [
    {
      label: 'Dashboard',
      path: '/bdc/dashboard',
      icon: LayoutDashboard,
      title: 'Dashboard',
      subtitle: 'BDC Manager Dashboard',
      description: 'BDC operations overview.',
    },
    {
      label: 'Qualified Leads',
      path: '/bdc/leads',
      icon: UserCheck,
      title: 'Qualified Leads',
      subtitle: 'Qualified Lead List',
      description: 'Review AI-qualified leads ready for dispatch.',
    },
    {
      label: 'Lead Queue',
      path: '/bdc/queue',
      icon: ListOrdered,
      title: 'Lead Queue',
      subtitle: 'BDC Lead Queue',
      description: 'Manage the live BDC lead queue.',
    },
    {
      label: 'Conversations',
      path: '/bdc/conversations',
      icon: MessageSquare,
      title: 'Conversations',
      subtitle: 'BDC Conversations',
      description: 'Monitor active BDC conversations.',
    },
    {
      label: 'SLA Monitoring',
      path: '/bdc/sla',
      icon: Timer,
      title: 'SLA Monitoring',
      subtitle: 'Service Level Monitoring',
      description: 'Track response times and SLA compliance.',
    },
    {
      label: 'Team Performance',
      path: '/bdc/team',
      icon: TrendingUp,
      title: 'Team Performance',
      subtitle: 'BDC Team Performance',
      description: 'Review BDC team productivity metrics.',
    },
    {
      label: 'Escalations',
      path: '/bdc/escalations',
      icon: AlertTriangle,
      title: 'Escalations',
      subtitle: 'Escalation Queue',
      description: 'Handle escalated leads and conversations.',
    },
  ],

  [ROLES.SALESPERSON]: [
    {
      label: 'Dashboard',
      path: '/salesperson/dashboard',
      icon: LayoutDashboard,
      title: 'Dashboard',
      subtitle: 'Salesperson Dashboard',
      description: 'Your sales activity overview.',
      mobilePriority: true,
    },
    {
      label: 'Incoming Leads',
      path: '/salesperson/incoming-leads',
      icon: Inbox,
      title: 'Incoming Leads',
      subtitle: 'New Lead Dispatch',
      description: 'Accept and respond to newly dispatched leads.',
      mobilePriority: true,
    },
    {
      label: 'My Leads',
      path: '/salesperson/leads',
      icon: ClipboardList,
      title: 'My Leads',
      subtitle: 'My Lead Pipeline',
      description: 'Track and manage your assigned leads.',
      mobilePriority: true,
    },
    {
      label: 'Scripts',
      path: '/salesperson/scripts',
      icon: FileText,
      title: 'Sales Scripts',
      subtitle: 'Approve and copy sales scripts',
      description: 'Approve Model 31 sales scripts, then copy them into CapCut or Instagram yourself.',
      mobilePriority: true,
    },
    {
      label: 'Conversations',
      path: '/salesperson/conversations',
      icon: MessageSquare,
      title: 'Conversations',
      subtitle: 'Customer Conversations',
      description: 'Continue conversations with your customers.',
      mobilePriority: true,
    },
    {
      label: 'Appointments',
      path: '/salesperson/appointments',
      icon: CalendarCheck,
      title: 'Appointments',
      subtitle: 'Manage upcoming customer appointments and follow-ups.',
      description: 'Manage upcoming customer appointments and follow-ups.',
    },
    {
      label: 'Sold Deals',
      path: '/salesperson/sold-deals',
      icon: Handshake,
      title: 'Sold Deals',
      subtitle: 'Closed deals and sale records.',
      description: 'Review sold deals and linked commission.',
    },
    {
      label: 'Commission',
      path: '/salesperson/commission',
      icon: Wallet,
      title: 'Commission',
      subtitle: 'Track sold deals, commission earnings and payout status.',
      description: 'Track sold deals, commission earnings and payout status.',
    },
  ],

  [ROLES.MARKETING_MANAGER]: [
    {
      label: 'Dashboard',
      path: '/marketing/dashboard',
      icon: LayoutDashboard,
      title: 'Marketing Dashboard',
      subtitle: 'Support portal for buyer signals and sales-script words. Model 31 does not auto-publish posts or videos.',
      description: 'Support portal for buyer signals and sales-script words. Model 31 does not auto-publish posts or videos.',
    },
    {
      label: 'Acquisition Dashboard',
      path: '/marketing/acquisition',
      icon: Radar,
      title: 'Customer Acquisition',
      subtitle:
        'Monitor customer engagement, buying signals, referrals, personas, communities and follow-up activity.',
      description:
        'Monitor customer engagement, buying signals, referrals, personas, communities and follow-up activity.',
      section: 'Customer Acquisition',
    },
    {
      label: 'Engagement',
      path: '/marketing/acquisition/engagement',
      icon: MessageCircleHeart,
      title: 'Engagement Tracking',
      subtitle:
        'Monitor customer interactions with dealership personas and marketing content.',
      description:
        'Monitor customer interactions with dealership personas and marketing content.',
      section: 'Customer Acquisition',
    },
    {
      label: 'Intent Signals',
      path: '/marketing/acquisition/intent',
      icon: Crosshair,
      title: 'Intent Signals',
      subtitle:
        'Identify customer conversations and engagement signals that may indicate purchase intent.',
      description:
        'Identify customer conversations and engagement signals that may indicate purchase intent.',
      section: 'Customer Acquisition',
    },
    {
      label: 'Referrals',
      path: '/marketing/acquisition/referrals',
      icon: Gift,
      title: 'Referral Engine',
      subtitle: 'Track referral opportunities and customer referral activity.',
      description: 'Track referral opportunities and customer referral activity.',
      section: 'Customer Acquisition',
    },
    {
      label: 'Life Events',
      path: '/marketing/acquisition/life-events',
      icon: CalendarHeart,
      title: 'Life Event Signals',
      subtitle:
        'Review customer signals that may indicate a change in vehicle needs.',
      description:
        'Review customer signals that may indicate a change in vehicle needs.',
      section: 'Customer Acquisition',
    },
    {
      label: 'Personas',
      path: '/marketing/acquisition/personas',
      icon: Network,
      title: 'Persona Network',
      subtitle: 'Manage marketing personas and compare their audience engagement.',
      description: 'Manage marketing personas and compare their audience engagement.',
      section: 'Customer Acquisition',
    },
    {
      label: 'Communities',
      path: '/marketing/acquisition/communities',
      icon: Globe2,
      title: 'Community Groups',
      subtitle:
        'Track dealership community presence and customer engagement opportunities.',
      description:
        'Track dealership community presence and customer engagement opportunities.',
      section: 'Customer Acquisition',
    },
    {
      label: 'Follow-Up Sequences',
      path: '/marketing/acquisition/follow-ups',
      icon: Workflow,
      title: 'Follow-Up Sequences',
      subtitle:
        'Manage structured multi-day follow-up workflows for eligible customer leads.',
      description:
        'Manage structured multi-day follow-up workflows for eligible customer leads.',
      section: 'Customer Acquisition',
    },
    {
      label: 'Sales Scripts',
      path: '/marketing/content',
      icon: Sparkles,
      title: 'Sales Scripts',
      subtitle: 'Generate sales-script words only. No video or auto-publish.',
      description: 'Generate sales-script words only. No video or auto-publish.',
    },
    {
      label: 'Approval Queue',
      path: '/marketing/approval',
      icon: CheckSquare,
      title: 'Approval Queue',
      subtitle: 'Review sales scripts before they go to the salesperson.',
      description: 'Review sales scripts before they go to the salesperson.',
    },
    {
      label: 'Scheduled Posts',
      path: '/marketing/scheduled',
      icon: CalendarClock,
      title: 'Scheduled Posts',
      subtitle: 'Model 31 does not auto-publish. Use this only as a reminder list.',
      description: 'Model 31 does not auto-publish. Use this only as a reminder list.',
    },
    {
      label: 'Social Accounts',
      path: '/marketing/social',
      icon: Share2,
      title: 'Social Accounts',
      subtitle: 'Connect and manage dealership social platforms.',
      description: 'Connect and manage dealership social platforms.',
    },
    {
      label: 'Campaigns',
      path: '/marketing/campaigns',
      icon: Target,
      title: 'Campaigns',
      subtitle: 'Plan and monitor marketing campaigns.',
      description: 'Plan and monitor marketing campaigns.',
    },
    {
      label: 'Performance',
      path: '/marketing/performance',
      icon: PieChart,
      title: 'Marketing Performance',
      subtitle: 'Analyze channel and campaign performance.',
      description: 'Analyze channel and campaign performance.',
    },
    {
      label: 'Attribution',
      path: '/marketing/attribution',
      icon: Link2,
      title: 'Marketing Attribution',
      subtitle: 'Track lead and conversion attribution.',
      description: 'Track lead and conversion attribution.',
    },
  ],
}

export function getNavForRole(role) {
  return ROLE_NAVIGATION[role] || []
}

export function findNavItemByPath(pathname, role) {
  const items = getNavForRole(role)
  return (
    items.find((item) => item.path === pathname) ||
    items.find(
      (item) =>
        pathname.startsWith(`${item.path}/`) &&
        // Prefer exact module match over dashboard prefix collisions
        item.path.split('/').length >= pathname.split('/').length - 1,
    ) ||
    items.find((item) => pathname.startsWith(`${item.path}/`)) ||
    null
  )
}

export function getSettingsPathForRole(role) {
  const settingsItem = getNavForRole(role).find((item) => item.isSettings)
  if (settingsItem) return settingsItem.path
  return '/settings'
}

export function getAllRolePaths() {
  return Object.values(ROLE_NAVIGATION).flatMap((items) =>
    items.map((item) => item.path),
  )
}

export function getPageTitle(pathname, role) {
  if (/^\/super-admin\/dealerships\/[^/]+$/.test(pathname)) {
    return 'Dealership Details'
  }
  if (/^\/super-admin\/leads\/[^/]+$/.test(pathname)) {
    return 'Lead Details'
  }
  if (/^\/salesperson\/leads\/[^/]+$/.test(pathname)) {
    return 'Lead Details'
  }
  if (/^\/salesperson\/appointments\/[^/]+$/.test(pathname)) {
    return 'Appointment Details'
  }
  if (/^\/salesperson\/scripts\/[^/]+$/.test(pathname)) {
    return 'Script Details'
  }
  if (/^\/marketing\/acquisition\/engagement\/[^/]+$/.test(pathname)) {
    return 'Engagement Details'
  }
  if (/^\/marketing\/acquisition\/personas\/[^/]+$/.test(pathname)) {
    return 'Persona Details'
  }
  if (/^\/marketing\/acquisition\/communities\/[^/]+$/.test(pathname)) {
    return 'Community Details'
  }
  if (/^\/marketing\/acquisition\/follow-ups\/[^/]+$/.test(pathname)) {
    return 'Follow-Up Sequence'
  }
  if (/^\/marketing\/content\/create$/.test(pathname)) {
    return 'Create Sales Script'
  }
  if (/^\/marketing\/content\/[^/]+$/.test(pathname)) {
    return 'Script Details'
  }
  if (/^\/marketing\/campaigns\/[^/]+$/.test(pathname)) {
    return 'Campaign Details'
  }
  if (/^\/super-admin\/events\/[^/]+$/.test(pathname)) {
    return 'Event Details'
  }
  if (/^\/super-admin\/crm-integrations\/[^/]+$/.test(pathname)) {
    return 'CRM Connection Details'
  }
  if (/^\/super-admin\/customer-identity\/[^/]+$/.test(pathname)) {
    return 'Customer Details'
  }
  if (/^\/super-admin\/inventory\/[^/]+$/.test(pathname)) {
    return 'Inventory Details'
  }
  if (/^\/super-admin\/pipeline-transparency\/[^/]+$/.test(pathname)) {
    return 'Lead Details'
  }
  if (/^\/super-admin\/negotiation-control\/[^/]+$/.test(pathname)) {
    return 'Negotiation Limits'
  }
  if (/^\/super-admin\/deal-handoffs\/[^/]+$/.test(pathname)) {
    return 'Deal Handoff'
  }
  const item = findNavItemByPath(pathname, role)
  if (item) return item.title
  if (pathname === '/profile') return 'Profile'
  if (pathname === '/settings') return 'Settings'
  if (pathname === '/access-denied') return 'Access Restricted'
  return 'Model 31'
}

export function buildBreadcrumbs(pathname, role) {
  if (pathname === '/profile') {
    return [{ label: 'Profile', path: '/profile' }]
  }
  if (pathname === '/settings') {
    return [{ label: 'Settings', path: '/settings' }]
  }
  if (pathname === '/access-denied') {
    return [{ label: 'Access Restricted', path: '/access-denied' }]
  }

  const dealershipDetailMatch = pathname.match(
    /^\/super-admin\/dealerships\/([^/]+)$/,
  )
  if (dealershipDetailMatch) {
    const dashboard = getNavForRole(role).find((nav) =>
      nav.path.endsWith('/dashboard'),
    )
    const crumbs = []
    if (dashboard) {
      crumbs.push({ label: 'Dashboard', path: dashboard.path })
    }
    crumbs.push({
      label: 'Dealerships',
      path: '/super-admin/dealerships',
    })
    crumbs.push({ label: 'Dealership Details', path: pathname })
    return crumbs
  }

  const leadDetailMatch = pathname.match(/^\/super-admin\/leads\/([^/]+)$/)
  if (leadDetailMatch) {
    const dashboard = getNavForRole(role).find((nav) =>
      nav.path.endsWith('/dashboard'),
    )
    const crumbs = []
    if (dashboard) {
      crumbs.push({ label: 'Dashboard', path: dashboard.path })
    }
    crumbs.push({ label: 'Leads', path: '/super-admin/leads' })
    crumbs.push({ label: 'Lead Details', path: pathname })
    return crumbs
  }

  const spLeadDetailMatch = pathname.match(/^\/salesperson\/leads\/([^/]+)$/)
  if (spLeadDetailMatch) {
    const crumbs = [
      { label: 'My Leads', path: '/salesperson/leads' },
      { label: 'Lead Details', path: pathname },
    ]
    return crumbs
  }

  const spApptDetailMatch = pathname.match(
    /^\/salesperson\/appointments\/([^/]+)$/,
  )
  if (spApptDetailMatch) {
    return [
      { label: 'Appointments', path: '/salesperson/appointments' },
      { label: 'Appointment Details', path: pathname },
    ]
  }

  const spScriptDetailMatch = pathname.match(/^\/salesperson\/scripts\/([^/]+)$/)
  if (spScriptDetailMatch) {
    return [
      { label: 'Scripts', path: '/salesperson/scripts' },
      { label: 'Script Details', path: pathname },
    ]
  }

  const marketingContentCreate = pathname === '/marketing/content/create'
  if (marketingContentCreate) {
    return [
      { label: 'Sales Scripts', path: '/marketing/content' },
      { label: 'Create Sales Script', path: pathname },
    ]
  }

  const marketingContentDetail = pathname.match(/^\/marketing\/content\/([^/]+)$/)
  if (marketingContentDetail) {
    return [
      { label: 'Sales Scripts', path: '/marketing/content' },
      { label: 'Script Details', path: pathname },
    ]
  }

  const marketingCampaignDetail = pathname.match(
    /^\/marketing\/campaigns\/([^/]+)$/,
  )
  if (marketingCampaignDetail) {
    return [
      { label: 'Campaigns', path: '/marketing/campaigns' },
      { label: 'Campaign Details', path: pathname },
    ]
  }

  const crmDetailMatch = pathname.match(
    /^\/super-admin\/crm-integrations\/([^/]+)$/,
  )
  if (crmDetailMatch) {
    return [
      { label: 'CRM Integrations', path: '/super-admin/crm-integrations' },
      { label: 'CRM Connection Details', path: pathname },
    ]
  }

  const customerDetailMatch = pathname.match(
    /^\/super-admin\/customer-identity\/([^/]+)$/,
  )
  if (customerDetailMatch) {
    return [
      { label: 'Customer Identity', path: '/super-admin/customer-identity' },
      { label: 'Customer Details', path: pathname },
    ]
  }

  const inventoryDetailMatch = pathname.match(
    /^\/super-admin\/inventory\/([^/]+)$/,
  )
  if (inventoryDetailMatch) {
    return [
      { label: 'Inventory', path: '/super-admin/inventory' },
      { label: 'Inventory Details', path: pathname },
    ]
  }

  const pipelineLeadMatch = pathname.match(
    /^\/super-admin\/pipeline-transparency\/([^/]+)$/,
  )
  if (pipelineLeadMatch) {
    return [
      { label: 'Pipeline Transparency', path: '/super-admin/pipeline-transparency' },
      { label: 'Lead Details', path: pathname },
    ]
  }

  const negotiationLimitMatch = pathname.match(
    /^\/super-admin\/negotiation-control\/([^/]+)$/,
  )
  if (negotiationLimitMatch) {
    return [
      { label: 'Negotiation Control', path: '/super-admin/negotiation-control' },
      { label: 'Negotiation Limits', path: pathname },
    ]
  }

  const dealHandoffMatch = pathname.match(
    /^\/super-admin\/deal-handoffs\/([^/]+)$/,
  )
  if (dealHandoffMatch) {
    return [
      { label: 'Deal Handoffs', path: '/super-admin/deal-handoffs' },
      { label: 'Deal Handoff', path: pathname },
    ]
  }

  const item = findNavItemByPath(pathname, role)
  if (!item) {
    return [{ label: 'Page', path: pathname }]
  }

  const dashboard = getNavForRole(role).find((nav) =>
    nav.path.endsWith('/dashboard'),
  )

  if (item.path.endsWith('/dashboard')) {
    return [{ label: item.label, path: item.path }]
  }

  const crumbs = []
  if (dashboard) {
    crumbs.push({ label: 'Dashboard', path: dashboard.path })
  }
  crumbs.push({ label: item.label, path: item.path })
  return crumbs
}
