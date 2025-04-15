import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight, Key } from "lucide-react";
import CopyButton from "./copy-button";

interface CredentialsCardProps {
  appName: string;
  appId: string;
  apiKey: string;
  plan?: string;
}

export default function CredentialsCard({ appName, appId, apiKey, plan = "Cancelled Plan" }: CredentialsCardProps) {
  const [expanded, setExpanded] = useState(true);
  
  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between p-4 border-b border-border">
        <CardTitle className="flex items-center text-base font-medium">
          <Key className="h-5 w-5 text-muted-foreground mr-2" />
          Credentials
        </CardTitle>
        <button 
          className="text-muted-foreground hover:text-foreground"
          onClick={() => setExpanded(!expanded)}
        >
          <ChevronRight className={`h-5 w-5 transform transition-transform ${expanded ? 'rotate-90' : ''}`} />
        </button>
      </CardHeader>
      
      {expanded && (
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">App name</div>
              <div className="font-medium">{appName}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">App ID</div>
              <div className="font-mono text-sm bg-muted p-2 rounded border border-border flex justify-between items-center">
                <span>{appId}</span>
                <CopyButton value={appId} />
              </div>
            </div>
          </div>
          
          <div>
            <div className="text-sm text-muted-foreground">Key</div>
            <div className="font-mono text-sm bg-muted p-2 rounded border border-border flex justify-between items-center">
              <span>{apiKey}</span>
              <CopyButton value={apiKey} />
            </div>
          </div>
          
          <div>
            <div className="text-sm text-muted-foreground">Plan</div>
            <div className="text-destructive font-medium">{plan}</div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
