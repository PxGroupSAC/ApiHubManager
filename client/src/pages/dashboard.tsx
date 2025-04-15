import { useQuery } from "@tanstack/react-query";
import { FileText, Zap, Building } from "lucide-react";
import { CURRENT_USER_ID } from "@/lib/data";
import CredentialsCard from "@/components/credentials-card";
import QuickLink from "@/components/quick-link";
import ClientInfoCard from "@/components/ClientInfoCard";
import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import ClientLogin from "@/components/ClientLogin";

export default function Dashboard() {
  // Fetch user's primary application and API key
  const { data: applications, isLoading } = useQuery({
    queryKey: [`/api/applications?userId=${CURRENT_USER_ID}`],
    queryFn: async () => {
      const res = await fetch(`/api/applications?userId=${CURRENT_USER_ID}`);
      if (!res.ok) throw new Error("Failed to fetch applications");
      return res.json();
    }
  });
  
  const primaryApp = applications && applications.length > 0 ? applications[0] : null;
  
  // Fetch API keys for the primary application
  const { data: apiKeys, isLoading: isLoadingKeys } = useQuery({
    queryKey: primaryApp ? [`/api/applications/${primaryApp.id}/api-keys`] : [],
    queryFn: async () => {
      const res = await fetch(`/api/applications/${primaryApp.id}/api-keys`);
      if (!res.ok) throw new Error("Failed to fetch API keys");
      return res.json();
    },
    enabled: !!primaryApp
  });
  
  const primaryKey = apiKeys && apiKeys.length > 0 ? apiKeys[0].key : "";

  // Fetch client info (cliente autenticado)
  const [client, setClient] = useState(null);
  useEffect(() => {
    apiRequest("GET", "/clients/me")
      .then(res => res.json())
      .then(setClient)
      .catch(() => {});
  }, []);

  const handleReadDocs = () => {
    // Open documentation in a new tab
    window.open("https://api-docs.example.com", "_blank");
  };
  
  const handleQuickStart = () => {
    // Open quick start guide in a new tab
    window.open("https://api-quickstart.example.com", "_blank");
  };
  
  const handleContactSales = () => {
    // Open contact form or send email
    window.open("mailto:sales@example.com", "_blank");
  };
  
  return (
    <div>
      <ClientLogin />
      {client && <ClientInfoCard client={client} />}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Service Overview</p>
        </div>
        <div className="text-sm text-right">
          <div className="text-destructive">Cancelled Plan</div>
        </div>
      </div>
      
      {isLoading || isLoadingKeys ? (
        <div className="bg-background p-12 flex items-center justify-center">
          <p className="text-muted-foreground">Loading application details...</p>
        </div>
      ) : primaryApp ? (
        <CredentialsCard
          appName={primaryApp.name}
          appId={primaryApp.appId}
          apiKey={primaryKey}
          plan="Cancelled Plan"
        />
      ) : (
        <div className="bg-background p-12 text-center">
          <p className="text-muted-foreground">No applications found. Create one to get started.</p>
        </div>
      )}
      
      {/* Quick links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <QuickLink
          title="Read our Docs"
          description="Learn about the API"
          icon={FileText}
          iconColor="text-green-500"
          onClick={handleReadDocs}
        />
        
        <QuickLink
          title="Quick Start Guide"
          description="Make your first API call"
          icon={Zap}
          iconColor="text-primary"
          onClick={handleQuickStart}
        />
        
        <QuickLink
          title="Need On-Premises?"
          description="Contact our sales team"
          icon={Building}
          iconColor="text-purple-500"
          onClick={handleContactSales}
        />
      </div>
      
      <div className="bg-card p-4 rounded-lg shadow-sm mb-6 border border-border">
        <div className="text-sm text-muted-foreground mb-2">Questions or feedback about API Manager?</div>
        <a href="mailto:support@example.com" className="text-primary hover:underline text-sm">
          Email our friendly support team.
        </a>
      </div>
    </div>
  );
}
