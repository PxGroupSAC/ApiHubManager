import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pencil, CreditCard, MailOpen, FileText, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DOMAIN } from "@/lib/data";
import { apiRequest } from "@/lib/queryClient";

export default function Account() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState("team");
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberRole, setNewMemberRole] = useState("member");
  
  // Fetch team members
  const { data: teamMembers, isLoading } = useQuery({
    queryKey: [`/api/team/${DOMAIN}`],
    queryFn: async () => {
      const res = await fetch(`/api/team/${DOMAIN}`);
      if (!res.ok) throw new Error("Failed to fetch team members");
      return res.json();
    }
  });
  
  // Add team member mutation
  const addMemberMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/team", {
        userId: 1, // In a real app this would be the newly created user ID
        role: newMemberRole,
        domain: DOMAIN
      });
    },
    onSuccess: () => {
      toast({
        title: "Team member added",
        description: "The new team member has been added successfully"
      });
      queryClient.invalidateQueries({ queryKey: [`/api/team/${DOMAIN}`] });
      setIsAddingMember(false);
      setNewMemberEmail("");
      setNewMemberRole("member");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add team member",
        variant: "destructive"
      });
    }
  });
  
  const handleAddMember = () => {
    if (!newMemberEmail) {
      toast({
        title: "Validation error",
        description: "Email is required",
        variant: "destructive"
      });
      return;
    }
    
    addMemberMutation.mutate();
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold">My Account</h1>
          <p className="text-sm text-muted-foreground">{DOMAIN}</p>
        </div>
        <div>
          <div className="text-destructive text-sm">Cancelled Plan</div>
        </div>
      </div>
      
      <Tabs defaultValue="team" value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="invitations">Invitations</TabsTrigger>
          <TabsTrigger value="credit-card">Credit Card</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
        </TabsList>
        
        <TabsContent value="team" className="mt-6">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email ID</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4">
                        Loading team members...
                      </TableCell>
                    </TableRow>
                  ) : !teamMembers || teamMembers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4">
                        No team members found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    teamMembers.map((member) => (
                      <TableRow key={member.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">
                          {member.username || "Unknown User"}
                        </TableCell>
                        <TableCell>
                          {member.email || member.domain}
                        </TableCell>
                        <TableCell>
                          {member.role}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
          <Button className="mt-6" onClick={() => setIsAddingMember(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Team Member
          </Button>
        </TabsContent>
        
        <TabsContent value="invitations" className="mt-6">
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-8">
                <MailOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-1">No Pending Invitations</h3>
                <p className="text-muted-foreground">You don't have any pending team invitations</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="credit-card" className="mt-6">
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-1">No Payment Method</h3>
                <p className="text-muted-foreground mb-4">You don't have any payment method configured</p>
                <Button>
                  Add Payment Method
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="invoices" className="mt-6">
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-1">No Invoices</h3>
                <p className="text-muted-foreground">You don't have any invoices yet</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Add Team Member Dialog */}
      <Dialog open={isAddingMember} onOpenChange={setIsAddingMember}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Team Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email" 
                type="email" 
                value={newMemberEmail} 
                onChange={(e) => setNewMemberEmail(e.target.value)} 
                placeholder="Enter email address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={newMemberRole} onValueChange={setNewMemberRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsAddingMember(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddMember}
              disabled={addMemberMutation.isPending}
            >
              Add Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
