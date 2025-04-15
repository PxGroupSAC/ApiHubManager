import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";

import Layout from "./components/layout";
import Dashboard from "./pages/dashboard";
import Applications from "./pages/applications";
import ApiServices from "./pages/apis";
import Statistics from "./pages/statistics";
import Account from "./pages/account";
import NotFound from "./pages/not-found";
import AuthPage from "./pages/auth-page";
import { AuthProvider } from "./hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={Dashboard} />
      <ProtectedRoute path="/applications" component={Applications} />
      <ProtectedRoute path="/apis" component={ApiServices} />
      <ProtectedRoute path="/statistics" component={Statistics} />
      <ProtectedRoute path="/account" component={Account} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Layout>
          <Router />
        </Layout>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
