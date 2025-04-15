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

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Layout>
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/applications" component={Applications} />
          <Route path="/apis" component={ApiServices} />
          <Route path="/statistics" component={Statistics} />
          <Route path="/account" component={Account} />
          <Route component={NotFound} />
        </Switch>
      </Layout>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
