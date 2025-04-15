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

// Hook para detectar el modo de autenticación
function useAuthMode() {
  if (typeof window === 'undefined') return 'sin clave';
  const adminKey = localStorage.getItem("x-admin-key");
  const clientKey = localStorage.getItem("x-api-key");
  if (adminKey) return "admin";
  if (clientKey) return "cliente";
  return "sin clave";
}

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
  
  // Adaptador para APIs reales del backend
  const { data: apis = [] } = useQuery({
    queryKey: ["apis"],
    queryFn: async () => {
      const res = await apiRequest("GET", "http://127.0.0.1:8000/apis");
      const raw = await res.json();
      return (raw as any[]).map((api: any, i: number) => ({
        id: i,
        applicationId: 0,
        apiType: {
          id: i,
          name: api.name,
          description: api.base_url,
          methods: api.allowed_methods
        },
        apiKey: "",
        isActive: api.enabled
      }));
    }
  });

  console.log("📦 APIs cargadas:", apis);
  
  // Detectar modo de autenticación
  const authMode = useAuthMode();

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
      ) : null}
      {/* Indicador de modo de autenticación */}
      <div className="mb-4">
        <span className={`inline-block px-3 py-1 rounded text-white text-xs ${authMode === "admin" ? "bg-green-600" : authMode === "cliente" ? "bg-blue-600" : "bg-gray-400"}`}>
          {authMode === "admin" && "🔑 Modo Admin"}
          {authMode === "cliente" && "🔒 Modo Cliente"}
          {authMode === "sin clave" && "⚠️ Sin clave de autenticación"}
        </span>
      </div>
      {/* Sección de APIs reales del backend */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold mb-4">APIs reales del backend</h2>
        <div className="border border-red-500 p-4 mb-4">
          {apis.length > 0 ? "✅ APIs cargadas" : "❌ No APIs"}
        </div>
        {apis.length === 0 ? (
          <div className="text-muted-foreground italic">
            No se encontraron APIs. Verifica que el backend responda correctamente a <code>/apis</code> y que hayas guardado la clave <code>x-admin-key</code> en <code>localStorage</code>.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {apis.map((api: any) => {
              console.log("🔍 API desde backend:", api);
              return <ApiServiceCard key={api.id} {...api} />;
            })}
          </div>
        )}
      </div>

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
                  {applications && applications.map((app: any) => (
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
                  {apiTypes && apiTypes.map((type: any) => (
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
