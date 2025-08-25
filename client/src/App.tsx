import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import Home from "@/pages/home";
import Landing from "@/pages/landing";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import Admin from "@/pages/admin";
import Dashboard from "@/pages/dashboard";
import ProjectDashboard from "@/pages/project-dashboard";
import Tasks from "@/pages/tasks";
import Productivity from "@/pages/productivity";
import CreateProposal from "@/pages/create-proposal";
import CreateInvoice from "@/pages/create-invoice";
import CreateContract from "@/pages/create-contract";
import CreatePresentation from "@/pages/create-presentation";
import { MessagesPage } from "@/pages/messages";
import Onboarding from "@/pages/onboarding";
import NotFound from "@/pages/not-found";
import Test404 from "@/pages/test-404";

function Router() {
  const { user, isAuthenticated, isLoading, isAdmin } = useAuth();
  const [location, setLocation] = useLocation();

  // Redirect authenticated users away from login/signup pages
  useEffect(() => {
    if (isAuthenticated && (location === '/login' || location === '/signup')) {
      setLocation('/');
    }
  }, [isAuthenticated, location, setLocation]);

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
        <Route path="/test-404" component={Test404} />
        <Route component={Landing} />
      </Switch>
    );
  }

  // Check if user needs to complete onboarding
  if (user && !user.hasCompletedOnboarding) {
    return <Onboarding onComplete={() => window.location.reload()} />;
  }

  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/tasks" component={Tasks} />
      <Route path="/productivity" component={Productivity} />
      <Route path="/project/:projectId" component={ProjectDashboard} />
      <Route path="/messages" component={MessagesPage} />
      <Route path="/create-proposal" component={CreateProposal} />
      <Route path="/create-invoice" component={CreateInvoice} />
      <Route path="/create-contract" component={CreateContract} />
      <Route path="/create-presentation" component={CreatePresentation} />
      {isAdmin && <Route path="/admin" component={Admin} />}
      {isAdmin && <Route path="/dashboard" component={Dashboard} />}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
