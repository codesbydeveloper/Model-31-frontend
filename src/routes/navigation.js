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
} from 'lucide-react'
import { ROLES } from '../data/roles'

/**
 * Centralized role-based navigation for Model 31.
 * Placeholder routes only — business modules come in later steps.
 */

export const SIDEBAR_COLLAPSED_KEY = 'model31_sidebar_collapsed'

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
      title: 'Dashboard',
      subtitle: 'Super Admin Dashboard',
      description: 'Platform overview and administrative controls.',
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
      subtitle: 'Create, approve, schedule and monitor AI-powered dealership marketing content.',
      description: 'Create, approve, schedule and monitor AI-powered dealership marketing content.',
    },
    {
      label: 'AI Content',
      path: '/marketing/content',
      icon: Sparkles,
      title: 'AI Content',
      subtitle: 'Create and manage AI-generated dealership marketing content.',
      description: 'Create and manage AI-generated dealership marketing content.',
    },
    {
      label: 'Approval Queue',
      path: '/marketing/approval',
      icon: CheckSquare,
      title: 'Approval Queue',
      subtitle: 'Review and approve marketing content before publishing.',
      description: 'Review and approve marketing content before publishing.',
    },
    {
      label: 'Scheduled Posts',
      path: '/marketing/scheduled',
      icon: CalendarClock,
      title: 'Scheduled Posts',
      subtitle: 'Calendar and list of scheduled marketing content.',
      description: 'Manage upcoming scheduled posts.',
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
  if (/^\/marketing\/content\/create$/.test(pathname)) {
    return 'Create Content'
  }
  if (/^\/marketing\/content\/[^/]+$/.test(pathname)) {
    return 'Content Details'
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

  const marketingContentCreate = pathname === '/marketing/content/create'
  if (marketingContentCreate) {
    return [
      { label: 'AI Content', path: '/marketing/content' },
      { label: 'Create Content', path: pathname },
    ]
  }

  const marketingContentDetail = pathname.match(/^\/marketing\/content\/([^/]+)$/)
  if (marketingContentDetail) {
    return [
      { label: 'AI Content', path: '/marketing/content' },
      { label: 'Content Details', path: pathname },
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
