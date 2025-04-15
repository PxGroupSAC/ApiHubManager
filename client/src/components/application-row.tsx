import { useState } from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Eye, Pencil } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Application } from "@shared/schema";
import { formatApiKey } from "@/lib/utils";
import CopyButton from "./copy-button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface ApplicationRowProps {
  application: Application;
  onView: (application: Application) => void;
}

export default function ApplicationRow({ application, onView }: ApplicationRowProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(application.name);
  const [description, setDescription] = useState(application.description || "");
  
  // Fetch API keys for this application
  const { data: apiKeys } = useQuery({
    queryKey: [`/api/applications/${application.id}/api-keys`],
    queryFn: async () => {
      const res = await fetch(`/api/applications/${application.id}/api-keys`);
      if (!res.ok) throw new Error("Failed to fetch API keys");
      return res.json();
    },
    enabled: !!application.id
  });
  
  // Find the primary API key
  const primaryKey = apiKeys && apiKeys.length > 0 ? apiKeys[0].key : "";
  
  // Update application mutation
  const updateMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("PUT", `/api/applications/${application.id}`, { name, description });
    },
    onSuccess: () => {
      toast({
        title: "Application updated",
        description: "The application has been updated successfully"
      });
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
      setIsEditing(false);
    },
    onError: () => {
      toast({
        title: "Update failed",
        description: "Failed to update the application",
        variant: "destructive"
      });
    }
  });
  
  const handleUpdate = () => {
    if (name.trim() === "") {
      toast({
        title: "Validation error",
        description: "Application name cannot be empty",
        variant: "destructive"
      });
      return;
    }
    
    updateMutation.mutate();
  };
  
  return (
    <>
      <TableRow className="hover:bg-muted/50">
        <TableCell className="font-medium">{application.name}</TableCell>
        <TableCell className="text-muted-foreground">{application.description}</TableCell>
        <TableCell className="font-mono text-sm">
          <div className="flex items-center">
            <span>{application.appId}</span>
            <CopyButton value={application.appId} className="ml-2" />
          </div>
        </TableCell>
        <TableCell className="font-mono text-sm">
          <div className="flex items-center">
            <span>{formatApiKey(primaryKey)}</span>
            <CopyButton value={primaryKey} className="ml-2" />
          </div>
        </TableCell>
        <TableCell>
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => onView(application)}
              title="View application details"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setIsEditing(true)}
              title="Edit application"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
        </TableCell>
      </TableRow>
      
      {/* Edit Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Application</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Application Name</Label>
              <Input 
                id="name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="Enter application name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
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
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpdate}
              disabled={updateMutation.isPending}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
