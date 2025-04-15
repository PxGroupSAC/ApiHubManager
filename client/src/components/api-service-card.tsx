import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ApiType } from "@shared/schema";
import CopyButton from "./copy-button";
import { queryClient } from "@/lib/queryClient";
import { toggleApiKey, createApiKey } from "@/lib/data";
import { formatApiKey } from "@/lib/utils";

interface ApiServiceCardProps {
  id?: number;
  applicationId: number;
  apiType: ApiType;
  apiKey?: string;
  isActive?: boolean;
}

export default function ApiServiceCard({ 
  id, 
  applicationId, 
  apiType, 
  apiKey,
  isActive = true
}: ApiServiceCardProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(isActive);
  
  const handleToggleActivation = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const newState = !active;
      await toggleApiKey(id, newState);
      setActive(newState);
      toast({
        title: newState ? "API Activated" : "API Deactivated",
        description: `${apiType.name} has been ${newState ? "activated" : "deactivated"} successfully.`
      });
      queryClient.invalidateQueries({ queryKey: [`/api/applications/${applicationId}/api-keys`] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update API activation status.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleGenerateKey = async () => {
    try {
      setLoading(true);
      await createApiKey(applicationId, apiType.id);
      toast({
        title: "New API Key Generated",
        description: `A new key for ${apiType.name} has been created successfully.`
      });
      queryClient.invalidateQueries({ queryKey: [`/api/applications/${applicationId}/api-keys`] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate new API key.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card className="overflow-hidden border border-border">
      <CardHeader className="bg-muted flex-row justify-between items-center p-4 border-b border-border">
        <div>
          <CardTitle className="text-base font-medium">{apiType.name}</CardTitle>
          <span className="text-xs text-muted-foreground">{apiType.description}</span>
        </div>
        <div className="flex items-center">
          <span className={`text-sm ${active ? 'text-green-600' : 'text-muted-foreground'} mr-2`}>
            {active ? 'Active' : 'Inactive'}
          </span>
          <Switch checked={active} onCheckedChange={handleToggleActivation} disabled={loading} />
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="space-y-4">
          <div>
            <div className="text-sm text-muted-foreground mb-1">Methods</div>
            <div className="flex flex-wrap gap-2">
              {apiType.methods.map((method) => (
                <Badge key={method} variant="outline" className="bg-primary/10 text-primary text-xs">
                  {method}
                </Badge>
              ))}
            </div>
          </div>
          
          <div>
            <div className="text-sm text-muted-foreground mb-1">API Keys</div>
            {apiKey ? (
              <div className="font-mono text-sm truncate flex justify-between items-center">
                <div className="flex-1 truncate bg-muted p-2 rounded border border-border">
                  {apiKey}
                </div>
                <div className="flex-shrink-0 flex space-x-1 ml-2">
                  <CopyButton value={apiKey} />
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground italic">No key generated</div>
            )}
          </div>
          
          <div className="flex justify-between items-center">
            <Button variant="link" className="text-primary p-0">
              View Documentation
            </Button>
            <Button 
              onClick={handleGenerateKey} 
              disabled={loading}
              className="text-sm"
            >
              Generate New Key
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
