import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { MoodPaletteProvider } from "@/hooks/useMoodPalette";
import { I18nProvider } from "@/lib/i18n";
import { DemoModeProvider } from "@/hooks/useDemoMode";
import { DemoModeBanner } from "@/components/DemoModeBanner";
import { DemoSessionWarning } from "@/components/DemoSessionWarning";
import { DemoModeStatusBar } from "@/components/DemoModeBanner";
import { useEffect, useRef } from "react";
import Home from "@/pages/home";
import Landing from "@/pages/landing";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import Admin from "@/pages/admin";
import AdminDiagnostics from "@/pages/admin-diagnostics";
import Dashboard from "@/pages/dashboard";
import ProjectDashboard from "@/pages/project-dashboard";
import Tasks from "@/pages/tasks";
import Productivity from "@/pages/productivity";
import CreateProposal from "@/pages/create-proposal";
import CreateInvoice from "@/pages/create-invoice";
import Invoices from "@/pages/invoices";
import InvoiceDetails from "@/pages/invoice-details";
import InvoicePreview from "@/pages/invoice-preview";
import EditInvoice from "@/pages/edit-invoice";
import Payments from "@/pages/payments";
import CreateContract from "@/pages/create-contract";
import CreatePresentation from "@/pages/create-presentation";
import ClientList from "@/pages/client-list";
import ClientDetails from "@/pages/client-details";
import { MessagesPage } from "@/pages/messages";
import FilingCabinet from "@/pages/filing-cabinet";
import AgencyHub from "@/pages/agency-hub";
import UserManual from "@/pages/user-manual";
import BulkOperations from "@/pages/bulk-operations";
import CustomFields from "@/pages/custom-fields";
import WorkflowAutomation from "@/pages/workflow-automation";
import Onboarding from "@/pages/onboarding";
import QuickStartPage from "@/pages/quick-start";
import BrandSettingsPage from "@/pages/settings/brand";
import NotFound from "@/pages/not-found";
import Test404 from "@/pages/test-404";
import GarageAssistant from "@/pages/garage-assistant";
import Analytics from "@/pages/analytics";
import AIInsights from "@/pages/ai-insights";
import TeamCollaboration from "@/pages/team-collaboration";
import AdvancedReporting from "@/pages/advanced-reporting";
import APIWebhooks from "@/pages/api-webhooks";
import SSOManagement from "@/pages/sso-management";
import PermissionsManagement from "@/pages/permissions-management";
import AuditLogging from "@/pages/audit-logging";
import WhiteLabel from "@/pages/white-label";
import SmartScheduling from "@/pages/smart-scheduling";
import PredictiveAnalytics from "@/pages/predictive-analytics";
import EmailManagement from "@/pages/email-management";
import SlackIntegration from "@/pages/slack-integration";
import PerformanceDashboard from "@/pages/performance-dashboard";
import PayInvoice from "@/pages/pay-invoice";
import PricingTable from "@/components/PricingTable";
import AgentManagement from "@/pages/AgentManagement";
import Settings from "@/pages/settings";
import SocialQueuePage from "@/pages/ops/SocialQueuePage";
import RateLimitsPage from "@/pages/ops/RateLimitsPage";
import ConnectionsPage from "@/pages/settings/connections";
import MonitoringDashboard from "@/pages/monitoring/dashboard";
import GigsterCoachPage from "@/pages/gigster-coach";
import GigsterCoachSuggestionsPage from "@/pages/gigster-coach-suggestions";
import SystemStatusPage from "@/pages/system-status";
import { CommandPalette } from "@/components/CommandPalette";
import { KeyboardShortcutsGuide } from "@/components/KeyboardShortcutsGuide";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { QuickActionButton } from "@/components/QuickActionButton";
import { GigsterCoachFloatingButton } from "@/components/GigsterCoachFloatingButton";

// Mobile Pages
import MobileHome from "@/pages/mobile-home";
import MobileDashboard from "@/pages/mobile-dashboard";
import MobileTasks from "@/pages/mobile-tasks";
import MobileProjects from "@/pages/mobile-projects";
import MobileTimeTracking from "@/pages/mobile-time-tracking";
import MobileWorkflows from "@/pages/mobile-workflows";

function Router() {
  const [location, setLocation] = useLocation();

  // Check if we're on a mobile route - handle these first without authentication
  const isMobileRoute = location.startsWith('/mobile');

  // For mobile routes, show them immediately without any authentication checks
  if (isMobileRoute) {
    return (
      <Switch>
        <Route path="/mobile" component={MobileHome} />
        <Route path="/mobile/dashboard" component={MobileDashboard} />
        <Route path="/mobile/tasks" component={MobileTasks} />
        <Route path="/mobile/projects" component={MobileProjects} />
        <Route path="/mobile/time-tracking" component={MobileTimeTracking} />
        <Route path="/mobile/workflows" component={MobileWorkflows} />
        <Route component={MobileHome} />
      </Switch>
    );
  }

  // Only call useAuth for non-mobile routes
  const { user, isAuthenticated, isLoading, isFetching, isAdmin } = useAuth();

  // Redirect authenticated users away from login/signup pages
  useEffect(() => {
    if (isAuthenticated && (location === '/login' || location === '/signup')) {
      setLocation('/');
    }
  }, [isAuthenticated, location, setLocation]);

  // Dual-phase onboarding guard: enforce quick-start unless user just completed (during refetch)
  useEffect(() => {
    if (!user) return;
    
    // Enforce quick-start for incomplete users, but suspend during cache refetch
    // to prevent redirect loop when user completes onboarding
    if (!user.hasCompletedOnboarding && location !== '/quick-start' && !isFetching) {
      setLocation('/quick-start');
    }
  }, [user, location, isFetching, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/signup" component={Signup} />
        <Route path="/pricing" component={PricingTable} />
        <Route path="/test-404" component={Test404} />
        <Route path="/pay-invoice" component={PayInvoice} />
        <Route component={Landing} />
      </Switch>
    );
  }

  return (
    <Switch>      
      {/* Onboarding and Setup Routes */}
      <Route path="/quick-start" component={QuickStartPage} />
      
      {/* Desktop Routes */}
      <Route path="/" component={Home} />
      <Route path="/tasks" component={Tasks} />
      <Route path="/productivity" component={Productivity} />
      <Route path="/project/:projectId" component={ProjectDashboard} />
      <Route path="/messages" component={MessagesPage} />
      <Route path="/create-proposal" component={CreateProposal} />
      <Route path="/invoices" component={Invoices} />
      <Route path="/invoices/:id" component={InvoiceDetails} />
      <Route path="/invoices/:id/preview" component={InvoicePreview} />
      <Route path="/create-invoice" component={CreateInvoice} />
      <Route path="/edit-invoice/:id" component={EditInvoice} />
      <Route path="/payments" component={Payments} />
      <Route path="/create-contract" component={CreateContract} />
      <Route path="/create-presentation" component={CreatePresentation} />
      <Route path="/clients" component={ClientList} />
      <Route path="/client/:clientId" component={ClientDetails} />
      <Route path="/filing-cabinet" component={FilingCabinet} />
      <Route path="/agency-hub" component={AgencyHub} />
      <Route path="/user-manual" component={UserManual} />
      <Route path="/bulk-operations" component={BulkOperations} />
      <Route path="/custom-fields" component={CustomFields} />
      <Route path="/workflow-automation" component={WorkflowAutomation} />
      <Route path="/garage-assistant" component={GarageAssistant} />
      <Route path="/gigster-coach" component={GigsterCoachPage} />
      <Route path="/gigster-coach/suggestions" component={GigsterCoachSuggestionsPage} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/ai-insights" component={AIInsights} />
      <Route path="/team-collaboration" component={TeamCollaboration} />
      <Route path="/advanced-reporting" component={AdvancedReporting} />
      <Route path="/api-webhooks" component={APIWebhooks} />
      <Route path="/sso-management" component={SSOManagement} />
      <Route path="/permissions-management" component={PermissionsManagement} />
      <Route path="/audit-logging" component={AuditLogging} />
      <Route path="/white-label" component={WhiteLabel} />
      <Route path="/smart-scheduling" component={SmartScheduling} />
      <Route path="/predictive-analytics" component={PredictiveAnalytics} />
      <Route path="/email-management" component={EmailManagement} />
      <Route path="/slack-integration" component={SlackIntegration} />
      <Route path="/performance-dashboard" component={PerformanceDashboard} />
      <Route path="/pricing" component={PricingTable} />
      <Route path="/settings" component={Settings} />
      <Route path="/settings/brand" component={BrandSettingsPage} />
      <Route path="/system-status" component={SystemStatusPage} />
      {isAdmin && <Route path="/admin" component={Admin} />}
      {isAdmin && <Route path="/admin/diagnostics" component={AdminDiagnostics} />}
      {isAdmin && <Route path="/agent-management" component={AgentManagement} />}
      {isAdmin && <Route path="/ops/social-queue" component={SocialQueuePage} />}
      {isAdmin && <Route path="/ops/rate-limits" component={RateLimitsPage} />}
      <Route path="/settings/connections" component={ConnectionsPage} />
      <Route path="/monitoring" component={MonitoringDashboard} />
      {isAdmin && <Route path="/dashboard" component={Dashboard} />}
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const [location] = useLocation();
  const hideQuickActionOnHome = location === "/";
  
  return (
    <>
      <DemoModeStatusBar />
      <DemoModeBanner />
      <DemoSessionWarning />
      <CommandPalette />
      <KeyboardShortcutsGuide />
      <OfflineIndicator />
      {!hideQuickActionOnHome && <QuickActionButton />}
      <GigsterCoachFloatingButton />
      <Toaster />
      <Router />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <DemoModeProvider>
          <MoodPaletteProvider>
            <TooltipProvider>
              <AppContent />
            </TooltipProvider>
          </MoodPaletteProvider>
        </DemoModeProvider>
      </I18nProvider>
    </QueryClientProvider>
  );
}

export default App;
