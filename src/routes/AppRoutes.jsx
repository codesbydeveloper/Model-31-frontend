import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import AuthLayout from '../layouts/AuthLayout'
import ProtectedRoute from './ProtectedRoute'
import RoleRoute from './RoleRoute'
import Login from '../pages/auth/Login'
import AccessDeniedPage from '../pages/AccessDeniedPage'
import NotFoundPage from '../pages/NotFoundPage'
import ProfilePage from '../pages/ProfilePage'
import SettingsPlaceholder from '../pages/SettingsPlaceholder'
import HomePage from '../pages/HomePage'
import ModulesPage from '../pages/ModulesPage'
import SuperAdminDashboard from '../pages/super-admin/Dashboard'
import DealershipsPage from '../pages/super-admin/DealershipsPage'
import DealershipDetailPage from '../pages/super-admin/DealershipDetailPage'
import CitiesPage from '../pages/super-admin/CitiesPage'
import BuyerPersonasPage from '../pages/super-admin/BuyerPersonasPage'
import AiConfigurationPage from '../pages/super-admin/AiConfigurationPage'
import ScoringRulesPage from '../pages/super-admin/ScoringRulesPage'
import UsersPage from '../pages/super-admin/UsersPage'
import CrmIntegrationsPage from '../pages/super-admin/CrmIntegrationsPage'
import CrmIntegrationDetailPage from '../pages/super-admin/CrmIntegrationDetailPage'
import CustomerIdentityPage from '../pages/super-admin/CustomerIdentityPage'
import CustomerIdentityDetailPage from '../pages/super-admin/CustomerIdentityDetailPage'
import InventoryPage from '../pages/super-admin/InventoryPage'
import InventoryDetailPage from '../pages/super-admin/InventoryDetailPage'
import SocialIntegrationsPage from '../pages/super-admin/SocialIntegrationsPage'
import AnalyticsPage from '../pages/super-admin/AnalyticsPage'
import PlatformSettingsPage from '../pages/super-admin/PlatformSettingsPage'
import EventsPage from '../pages/super-admin/EventsPage'
import IntegrationHealthPage from '../pages/super-admin/IntegrationHealthPage'
import PlatformNotificationsPage from '../pages/super-admin/PlatformNotificationsPage'
import SystemControlsPage from '../pages/super-admin/SystemControlsPage'
import PipelineTransparencyPage from '../pages/super-admin/PipelineTransparencyPage'
import PipelineTransparencyDetailPage from '../pages/super-admin/PipelineTransparencyDetailPage'
import NegotiationControlPage from '../pages/super-admin/NegotiationControlPage'
import NegotiationLimitDetailPage from '../pages/super-admin/NegotiationLimitDetailPage'
import NegotiationTemplatesPage from '../pages/super-admin/NegotiationTemplatesPage'
import NegotiationTemplateDetailPage from '../pages/super-admin/NegotiationTemplateDetailPage'
import DealHandoffsPage from '../pages/super-admin/DealHandoffsPage'
import DealHandoffDetailPage from '../pages/super-admin/DealHandoffDetailPage'
import OemReportingPage from '../pages/super-admin/OemReportingPage'
import DealershipDashboard from '../pages/dealership/DealershipDashboard'
import DealershipCrmPage from '../pages/dealership/DealershipCrmPage'
import DealershipSocialPage from '../pages/dealership/DealershipSocialPage'
import DealershipLeadsPage from '../pages/dealership/DealershipLeadsPage'
import DealershipConversationsPage from '../pages/dealership/DealershipConversationsPage'
import DealershipSalespeoplePage from '../pages/dealership/DealershipSalespeoplePage'
import DealershipContentPage from '../pages/dealership/DealershipContentPage'
import DealershipReportsPage from '../pages/dealership/DealershipReportsPage'
import DealershipSettingsPage from '../pages/dealership/DealershipSettingsPage'
import EventDetailPage from '../pages/super-admin/EventDetailPage'
import LeadsPage from '../pages/super-admin/LeadsPage'
import LeadDetailPage from '../pages/super-admin/LeadDetailPage'
import BdcDashboard from '../pages/bdc/BdcDashboard'
import BdcQueuePage from '../pages/bdc/BdcQueuePage'
import BdcLeadsPage from '../pages/bdc/BdcLeadsPage'
import BdcConversationsPage from '../pages/bdc/BdcConversationsPage'
import BdcSlaPage from '../pages/bdc/BdcSlaPage'
import BdcTeamPage from '../pages/bdc/BdcTeamPage'
import BdcEscalationsPage from '../pages/bdc/BdcEscalationsPage'
import SalespersonDashboard from '../pages/salesperson/SalespersonDashboard'
import IncomingLeadsPage from '../pages/salesperson/IncomingLeadsPage'
import MyLeadsPage from '../pages/salesperson/MyLeadsPage'
import SalespersonLeadDetailPage from '../pages/salesperson/SalespersonLeadDetailPage'
import SalespersonConversationsPage from '../pages/salesperson/SalespersonConversationsPage'
import SalespersonAppointmentsPage from '../pages/salesperson/SalespersonAppointmentsPage'
import AppointmentDetailPage from '../pages/salesperson/AppointmentDetailPage'
import SalespersonCommissionPage from '../pages/salesperson/SalespersonCommissionPage'
import SoldDealsPage from '../pages/salesperson/SoldDealsPage'
import SalespersonScriptsPage from '../pages/salesperson/SalespersonScriptsPage'
import SalespersonScriptDetailPage from '../pages/salesperson/SalespersonScriptDetailPage'
import ScriptApprovePage from '../pages/salesperson/ScriptApprovePage'
import MarketingDashboard from '../pages/marketing/MarketingDashboard'
import MarketingContentPage from '../pages/marketing/MarketingContentPage'
import CreateContentPage from '../pages/marketing/CreateContentPage'
import ContentDetailPage from '../pages/marketing/ContentDetailPage'
import ApprovalQueuePage from '../pages/marketing/ApprovalQueuePage'
import ScheduledPostsPage from '../pages/marketing/ScheduledPostsPage'
import SocialAccountsPage from '../pages/marketing/SocialAccountsPage'
import CampaignsPage from '../pages/marketing/CampaignsPage'
import CampaignDetailPage from '../pages/marketing/CampaignDetailPage'
import MarketingPerformancePage from '../pages/marketing/MarketingPerformancePage'
import AttributionPage from '../pages/marketing/AttributionPage'
import AcquisitionDashboard from '../pages/marketing/acquisition/AcquisitionDashboard'
import EngagementPage from '../pages/marketing/acquisition/EngagementPage'
import EngagementDetailPage from '../pages/marketing/acquisition/EngagementDetailPage'
import IntentSignalsPage from '../pages/marketing/acquisition/IntentSignalsPage'
import ReferralsPage from '../pages/marketing/acquisition/ReferralsPage'
import LifeEventsPage from '../pages/marketing/acquisition/LifeEventsPage'
import PersonasPage from '../pages/marketing/acquisition/PersonasPage'
import PersonaDetailPage from '../pages/marketing/acquisition/PersonaDetailPage'
import CommunitiesPage from '../pages/marketing/acquisition/CommunitiesPage'
import CommunityDetailPage from '../pages/marketing/acquisition/CommunityDetailPage'
import FollowUpsPage from '../pages/marketing/acquisition/FollowUpsPage'
import FollowUpDetailPage from '../pages/marketing/acquisition/FollowUpDetailPage'
import { useAuth } from '../hooks/useAuth'
import { ROLES, getDashboardPathForRole } from '../data/roles'

function RootRedirect() {
  const { isAuthenticated, user } = useAuth()

  if (isAuthenticated && user) {
    return <Navigate to={getDashboardPathForRole(user.role)} replace />
  }

  return <Navigate to="/login" replace />
}

function ProtectedLayout() {
  return (
    <ProtectedRoute>
      <MainLayout />
    </ProtectedRoute>
  )
}

function RoleOutlet({ allowedRoles }) {
  return (
    <RoleRoute allowedRoles={allowedRoles}>
      <Outlet />
    </RoleRoute>
  )
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="login" element={<Login />} />
        <Route path="script-approve/:token" element={<ScriptApprovePage />} />
      </Route>

      <Route element={<ProtectedLayout />}>
        <Route path="access-denied" element={<AccessDeniedPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="settings" element={<SettingsPlaceholder />} />

        <Route path="home" element={<HomePage />} />
        <Route path="modules" element={<ModulesPage />} />

        <Route element={<RoleOutlet allowedRoles={[ROLES.SUPER_ADMIN]} />}>
          <Route path="super-admin/dashboard" element={<SuperAdminDashboard />} />
          <Route path="super-admin/dealerships" element={<DealershipsPage />} />
          <Route
            path="super-admin/dealerships/:id"
            element={<DealershipDetailPage />}
          />
          <Route path="super-admin/leads" element={<LeadsPage />} />
          <Route path="super-admin/leads/:id" element={<LeadDetailPage />} />
          <Route path="super-admin/cities" element={<CitiesPage />} />
          <Route
            path="super-admin/buyer-personas"
            element={<BuyerPersonasPage />}
          />
          <Route
            path="super-admin/ai-configuration"
            element={<AiConfigurationPage />}
          />
          <Route
            path="super-admin/scoring-rules"
            element={<ScoringRulesPage />}
          />
          <Route path="super-admin/users" element={<UsersPage />} />
          <Route
            path="super-admin/crm-integrations"
            element={<CrmIntegrationsPage />}
          />
          <Route
            path="super-admin/crm-integrations/:id"
            element={<CrmIntegrationDetailPage />}
          />
          <Route
            path="super-admin/customer-identity"
            element={<CustomerIdentityPage />}
          />
          <Route
            path="super-admin/customer-identity/:id"
            element={<CustomerIdentityDetailPage />}
          />
          <Route path="super-admin/inventory" element={<InventoryPage />} />
          <Route
            path="super-admin/inventory/:id"
            element={<InventoryDetailPage />}
          />
          <Route
            path="super-admin/social-integrations"
            element={<SocialIntegrationsPage />}
          />
          <Route
            path="super-admin/analytics"
            element={<AnalyticsPage />}
          />
          <Route
            path="super-admin/oem-reporting"
            element={<OemReportingPage />}
          />
          <Route path="super-admin/events" element={<EventsPage />} />
          <Route
            path="super-admin/events/:id"
            element={<EventDetailPage />}
          />
          <Route
            path="super-admin/integration-health"
            element={<IntegrationHealthPage />}
          />
          <Route
            path="super-admin/notifications"
            element={<PlatformNotificationsPage />}
          />
          <Route
            path="super-admin/pipeline-transparency"
            element={<PipelineTransparencyPage />}
          />
          <Route
            path="super-admin/pipeline-transparency/:id"
            element={<PipelineTransparencyDetailPage />}
          />
          <Route
            path="super-admin/negotiation-control"
            element={<NegotiationControlPage />}
          />
          <Route
            path="super-admin/negotiation-control/:id"
            element={<NegotiationLimitDetailPage />}
          />
          <Route
            path="super-admin/negotiation-templates"
            element={<NegotiationTemplatesPage />}
          />
          <Route
            path="super-admin/negotiation-templates/:id"
            element={<NegotiationTemplateDetailPage />}
          />
          <Route
            path="super-admin/deal-handoffs"
            element={<DealHandoffsPage />}
          />
          <Route
            path="super-admin/deal-handoffs/:id"
            element={<DealHandoffDetailPage />}
          />
          <Route
            path="super-admin/system-controls"
            element={<SystemControlsPage />}
          />
          <Route
            path="super-admin/settings"
            element={<PlatformSettingsPage />}
          />
        </Route>

        <Route
          element={<RoleOutlet allowedRoles={[ROLES.DEALERSHIP_ADMIN]} />}
        >
          <Route path="dealership/dashboard" element={<DealershipDashboard />} />
          <Route path="dealership/leads" element={<DealershipLeadsPage />} />
          <Route
            path="dealership/conversations"
            element={<DealershipConversationsPage />}
          />
          <Route
            path="dealership/salespeople"
            element={<DealershipSalespeoplePage />}
          />
          <Route path="dealership/social" element={<DealershipSocialPage />} />
          <Route path="dealership/crm" element={<DealershipCrmPage />} />
          <Route path="dealership/content" element={<DealershipContentPage />} />
          <Route path="dealership/reports" element={<DealershipReportsPage />} />
          <Route
            path="dealership/settings"
            element={<DealershipSettingsPage />}
          />
        </Route>

        <Route element={<RoleOutlet allowedRoles={[ROLES.BDC_MANAGER]} />}>
          <Route path="bdc/dashboard" element={<BdcDashboard />} />
          <Route path="bdc/leads" element={<BdcLeadsPage />} />
          <Route path="bdc/queue" element={<BdcQueuePage />} />
          <Route path="bdc/conversations" element={<BdcConversationsPage />} />
          <Route path="bdc/sla" element={<BdcSlaPage />} />
          <Route path="bdc/team" element={<BdcTeamPage />} />
          <Route path="bdc/escalations" element={<BdcEscalationsPage />} />
        </Route>

        <Route element={<RoleOutlet allowedRoles={[ROLES.SALESPERSON]} />}>
          <Route
            path="salesperson/dashboard"
            element={<SalespersonDashboard />}
          />
          <Route
            path="salesperson/incoming-leads"
            element={<IncomingLeadsPage />}
          />
          <Route path="salesperson/leads" element={<MyLeadsPage />} />
          <Route
            path="salesperson/leads/:id"
            element={<SalespersonLeadDetailPage />}
          />
          <Route
            path="salesperson/conversations"
            element={<SalespersonConversationsPage />}
          />
          <Route
            path="salesperson/appointments"
            element={<SalespersonAppointmentsPage />}
          />
          <Route
            path="salesperson/appointments/:id"
            element={<AppointmentDetailPage />}
          />
          <Route
            path="salesperson/sold-deals"
            element={<SoldDealsPage />}
          />
          <Route
            path="salesperson/commission"
            element={<SalespersonCommissionPage />}
          />
          <Route path="salesperson/scripts" element={<SalespersonScriptsPage />} />
          <Route
            path="salesperson/scripts/:id"
            element={<SalespersonScriptDetailPage />}
          />
        </Route>

        <Route
          element={<RoleOutlet allowedRoles={[ROLES.MARKETING_MANAGER]} />}
        >
          <Route path="marketing/dashboard" element={<MarketingDashboard />} />
          <Route path="marketing/content" element={<MarketingContentPage />} />
          <Route path="marketing/content/create" element={<CreateContentPage />} />
          <Route path="marketing/content/:id" element={<ContentDetailPage />} />
          <Route path="marketing/approval" element={<ApprovalQueuePage />} />
          <Route path="marketing/scheduled" element={<ScheduledPostsPage />} />
          <Route path="marketing/social" element={<SocialAccountsPage />} />
          <Route path="marketing/campaigns" element={<CampaignsPage />} />
          <Route path="marketing/campaigns/:id" element={<CampaignDetailPage />} />
          <Route
            path="marketing/performance"
            element={<MarketingPerformancePage />}
          />
          <Route path="marketing/attribution" element={<AttributionPage />} />
          <Route
            path="marketing/acquisition"
            element={<AcquisitionDashboard />}
          />
          <Route
            path="marketing/acquisition/engagement"
            element={<EngagementPage />}
          />
          <Route
            path="marketing/acquisition/engagement/:id"
            element={<EngagementDetailPage />}
          />
          <Route
            path="marketing/acquisition/intent"
            element={<IntentSignalsPage />}
          />
          <Route
            path="marketing/acquisition/referrals"
            element={<ReferralsPage />}
          />
          <Route
            path="marketing/acquisition/life-events"
            element={<LifeEventsPage />}
          />
          <Route
            path="marketing/acquisition/personas"
            element={<PersonasPage />}
          />
          <Route
            path="marketing/acquisition/personas/:id"
            element={<PersonaDetailPage />}
          />
          <Route
            path="marketing/acquisition/communities"
            element={<CommunitiesPage />}
          />
          <Route
            path="marketing/acquisition/communities/:id"
            element={<CommunityDetailPage />}
          />
          <Route
            path="marketing/acquisition/follow-ups"
            element={<FollowUpsPage />}
          />
          <Route
            path="marketing/acquisition/follow-ups/:id"
            element={<FollowUpDetailPage />}
          />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>

      <Route index element={<RootRedirect />} />
      <Route path="*" element={<RootRedirect />} />
    </Routes>
  )
}
