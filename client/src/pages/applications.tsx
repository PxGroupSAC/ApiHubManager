import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { CURRENT_USER_ID } from "@/lib/data";
import { Application } from "@shared/schema";
import ApplicationRow from "@/components/application-row";
import { apiRequest } from "@/lib/queryClient";

export default function Applications() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [clients, setClients] = useState<any[]>([]);
  
  // Fetch all applications for the current user
  const { data: applications, isLoading } = useQuery({
    queryKey: ["/api/applications", CURRENT_USER_ID],
    queryFn: async () => {
      const res = await fetch(`/api/applications?userId=${CURRENT_USER_ID}`);
      if (!res.ok) throw new Error("Failed to fetch applications");
      return res.json();
    }
  });
  
  // Fetch clients
  const { data: clientsData, isLoading: isLoadingClients } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/clients/all");
      return res.json();
    },
  });
  
  useEffect(() => {
    if (clientsData) setClients(clientsData);
  }, [clientsData]);
  
  // Create application mutation
  const createMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/applications", { 
        name, 
        description,
        userId: CURRENT_USER_ID
      });
    },
    onSuccess: () => {
      toast({
        title: "Application created",
        description: "Your new application has been created successfully"
      });
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
      setIsCreating(false);
      setName("");
      setDescription("");
    },
    onError: () => {
      toast({
        title: "Creation failed",
        description: "Failed to create the application",
        variant: "destructive"
      });
    }
  });
  
  const handleCreate = () => {
    if (name.trim() === "") {
      toast({
        title: "Validation error",
        description: "Application name cannot be empty",
        variant: "destructive"
      });
      return;
    }
    
    createMutation.mutate();
  };
  
  const handleViewApplication = (app: Application) => {
    setSelectedApp(app);
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Applications</h1>
          <p className="text-sm text-muted-foreground">List of Applications</p>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Application
        </Button>
      </div>
      
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name of Application</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>App ID</TableHead>
                  <TableHead>API Key</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">
                      Loading applications...
                    </TableCell>
                  </TableRow>
                ) : !applications || applications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">
                      No applications found. Create one to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  applications.map((app: Application) => (
                    <ApplicationRow 
                      key={app.id} 
                      application={app} 
                      onView={handleViewApplication}
                    />
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      {/* Tabla de Clients reales */}
      <Card className="mt-8">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Environment</TableHead>
                  <TableHead>Allowed APIs</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingClients ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">
                      Loading clients...
                    </TableCell>
                  </TableRow>
                ) : !clients || clients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">
                      No clients found.
                    </TableCell>
                  </TableRow>
                ) : (
                  clients.map((client) => (
                    <ApplicationRow 
                      key={client.id} 
                      application={{
                        id: client.id,
                        name: client.name,
                        description: client.environment,
                        appId: client.id,
                        createdAt: client.created_at,
                        // Adaptar según lo que ApplicationRow espera
                      }} 
                      onView={() => {}}
                    />
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      {/* Create Application Dialog */}
      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Application</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="create-name">Application Name</Label>
              <Input 
                id="create-name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="Enter application name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-description">Description</Label>
              <Textarea 
                id="create-description" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="Enter application description"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsCreating(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreate}
              disabled={createMutation.isPending}
            >
              Create Application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Application Details Dialog - Placeholder for expanded functionality */}
      {selectedApp && (
        <Dialog open={!!selectedApp} onOpenChange={() => setSelectedApp(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>{selectedApp.name}</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-muted-foreground mb-4">{selectedApp.description}</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground text-sm">Application ID</Label>
                  <div className="font-mono bg-muted p-2 rounded mt-1">{selectedApp.appId}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground text-sm">Created</Label>
                  <div className="p-2 mt-1">
                    {new Date(selectedApp.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setSelectedApp(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
