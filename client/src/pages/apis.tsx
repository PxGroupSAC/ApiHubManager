import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CURRENT_USER_ID } from "@/lib/data";
import ApiServiceCard from "@/components/api-service-card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";

export default function ApiServices() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isAddingApi, setIsAddingApi] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState<string>("");
  const [selectedApiTypeId, setSelectedApiTypeId] = useState<string>("");
  
  // Fetch API types
  const { data: apiTypes, isLoading: isLoadingApiTypes } = useQuery({
    queryKey: ["/api/api-types"],
    queryFn: async () => {
      const res = await fetch("/api/api-types");
      if (!res.ok) throw new Error("Failed to fetch API types");
      return res.json();
    }
  });
  
  // Fetch user's applications
  const { data: applications, isLoading: isLoadingApps } = useQuery({
    queryKey: ["/api/applications", CURRENT_USER_ID],
    queryFn: async () => {
      const res = await fetch(`/api/applications?userId=${CURRENT_USER_ID}`);
      if (!res.ok) throw new Error("Failed to fetch applications");
      return res.json();
    }
  });
  
  // Create API key mutation
  const createApiKeyMutation = useMutation({
    mutationFn: async () => {
      if (!selectedAppId || !selectedApiTypeId) {
        throw new Error("Application and API type must be selected");
      }
      
      return apiRequest("POST", "/api/api-keys", {
        applicationId: parseInt(selectedAppId),
        apiTypeId: parseInt(selectedApiTypeId)
      });
    },
    onSuccess: () => {
      toast({
        title: "API Enabled",
        description: "The API service has been enabled for your application"
      });
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
      setIsAddingApi(false);
      setSelectedAppId("");
      setSelectedApiTypeId("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to enable the API service",
        variant: "destructive"
      });
    }
  });
  
  // For each application, get its API keys with API types
  const { data: appApiKeys, isLoading: isLoadingKeys } = useQuery({
    queryKey: ["/api/app-api-keys"],
    queryFn: async () => {
      if (!applications) return [];
      
      const appApiKeysMap = new Map();
      
      for (const app of applications) {
        const res = await fetch(`/api/applications/${app.id}/api-keys`);
        if (res.ok) {
          const apiKeys = await res.json();
          appApiKeysMap.set(app.id, apiKeys);
        }
      }
      
      return appApiKeysMap;
    },
    enabled: !!applications && applications.length > 0
  });
  
  const handleAddApi = () => {
    createApiKeyMutation.mutate();
  };
  
  // Get all unique API type IDs that have been assigned to any application
  const assignedApiTypeIds = new Set();
  if (appApiKeys) {
    appApiKeys.forEach((apiKeys: any[]) => {
      apiKeys.forEach(key => {
        if (key.apiType) {
          assignedApiTypeIds.add(key.apiType.id);
        }
      });
    });
  }
  
  // Prepare data for rendering API service cards
  const availableApiTypes = apiTypes || [];
  const primaryApplication = applications && applications.length > 0 ? applications[0] : null;
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold">API Services</h1>
          <p className="text-sm text-muted-foreground">Manage your available API services</p>
        </div>
      </div>
      
      {isLoadingApiTypes || isLoadingApps || isLoadingKeys ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading API services...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Display API service cards for the primary app */}
          {availableApiTypes.map(apiType => {
            // Find the API key for this API type in the primary application
            const apiKeys = primaryApplication && appApiKeys 
              ? appApiKeys.get(primaryApplication.id) || [] 
              : [];
            
            const apiKey = apiKeys.find(key => key.apiType?.id === apiType.id);
            
            return (
              <ApiServiceCard
                key={apiType.id}
                id={apiKey?.id}
                applicationId={primaryApplication?.id || 0}
                apiType={apiType}
                apiKey={apiKey?.key}
                isActive={apiKey?.isActive ?? false}
              />
            );
          })}
          
          {/* Add New API Service Card */}
          <div 
            className="bg-card rounded-lg shadow-sm overflow-hidden border border-dashed border-border flex items-center justify-center p-12 cursor-pointer"
            onClick={() => setIsAddingApi(true)}
          >
            <div className="text-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                <Plus className="h-6 w-6" />
              </div>
              <h3 className="text-foreground font-medium mb-1">Enable New API</h3>
              <p className="text-muted-foreground text-sm mb-4">Add another API service to your account</p>
              <Button>
                Add API Service
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Add API Dialog */}
      <Dialog open={isAddingApi} onOpenChange={setIsAddingApi}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enable API Service</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="application">Application</Label>
              <Select value={selectedAppId} onValueChange={setSelectedAppId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select application" />
                </SelectTrigger>
                <SelectContent>
                  {applications && applications.map(app => (
                    <SelectItem key={app.id} value={app.id.toString()}>
                      {app.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="api-type">API Service</Label>
              <Select value={selectedApiTypeId} onValueChange={setSelectedApiTypeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select API service" />
                </SelectTrigger>
                <SelectContent>
                  {apiTypes && apiTypes.map(type => (
                    <SelectItem key={type.id} value={type.id.toString()}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsAddingApi(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddApi}
              disabled={createApiKeyMutation.isPending || !selectedAppId || !selectedApiTypeId}
            >
              Enable API
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
