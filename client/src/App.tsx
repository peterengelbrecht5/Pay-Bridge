import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { useMerchant } from "@/hooks/use-merchants";
import NotFound from "@/pages/not-found";

// Pages
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import Transactions from "@/pages/Transactions";
import ApiKeys from "@/pages/ApiKeys";
import Onboarding from "@/pages/Onboarding";
import PublicCheckout from "@/pages/PublicCheckout";
import { Sidebar } from "@/components/Sidebar";

function PrivateLayout({ children }: { children: React.ReactNode }) {
  const { data: merchant, isLoading } = useMerchant();

  // If loading merchant status, show spinner
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If authenticated but no merchant profile, redirect to onboarding
  // useMerchant returns null if 404 (not found)
  if (!merchant) {
    return <Redirect to="/onboarding" />;
  }

  // Authenticated + Merchant Profile exists -> Show Dashboard Layout
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 ml-64 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null; // or a loading spinner
  }

  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/checkout/:transactionId" component={PublicCheckout} />
      
      {/* Auth Logic */}
      {!isAuthenticated ? (
        // Public Landing Page
        <Route path="/" component={Landing} />
      ) : (
        // Private Routes
        <>
          <Route path="/onboarding" component={Onboarding} />
          <Route path="/">
            <PrivateLayout>
              <Dashboard />
            </PrivateLayout>
          </Route>
          <Route path="/transactions">
            <PrivateLayout>
              <Transactions />
            </PrivateLayout>
          </Route>
          <Route path="/keys">
            <PrivateLayout>
              <ApiKeys />
            </PrivateLayout>
          </Route>
          <Route path="/settings">
             <PrivateLayout>
               <div className="p-8">
                  <h1 className="text-3xl font-bold">Settings</h1>
                  <p className="text-muted-foreground mt-2">Account configuration coming soon.</p>
               </div>
             </PrivateLayout>
          </Route>
        </>
      )}

      {/* Fallback */}
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
