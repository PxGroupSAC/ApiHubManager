import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertApplicationSchema, 
  insertApiKeySchema,
  insertApiTypeSchema,
  insertTeamMemberSchema,
  insertUserSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Users routes
  app.get('/api/users/:id', async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const user = await storage.getUser(id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Don't return the password
    const { password, ...userWithoutPassword } = user;
    return res.json(userWithoutPassword);
  });
  
  // Team members routes
  app.get('/api/team/:domain', async (req: Request, res: Response) => {
    const domain = req.params.domain;
    const members = await storage.getTeamMembers(domain);
    
    // Fetch user details for each member
    const teamWithUserDetails = await Promise.all(members.map(async (member) => {
      const user = await storage.getUser(member.userId);
      return {
        ...member,
        username: user?.username,
        email: user?.email
      };
    }));
    
    return res.json(teamWithUserDetails);
  });
  
  app.post('/api/team', async (req: Request, res: Response) => {
    try {
      const validatedData = insertTeamMemberSchema.parse(req.body);
      const newMember = await storage.addTeamMember(validatedData);
      return res.status(201).json(newMember);
    } catch (error) {
      return res.status(400).json({ message: 'Invalid team member data' });
    }
  });
  
  app.put('/api/team/:id', async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const { role } = req.body;
    
    if (!role) {
      return res.status(400).json({ message: 'Role is required' });
    }
    
    const updatedMember = await storage.updateTeamMember(id, role);
    
    if (!updatedMember) {
      return res.status(404).json({ message: 'Team member not found' });
    }
    
    return res.json(updatedMember);
  });
  
  // API Types routes
  app.get('/api/api-types', async (_req: Request, res: Response) => {
    const apiTypes = await storage.getApiTypes();
    return res.json(apiTypes);
  });
  
  app.get('/api/api-types/:id', async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const apiType = await storage.getApiType(id);
    
    if (!apiType) {
      return res.status(404).json({ message: 'API type not found' });
    }
    
    return res.json(apiType);
  });
  
  app.post('/api/api-types', async (req: Request, res: Response) => {
    try {
      const validatedData = insertApiTypeSchema.parse(req.body);
      const newApiType = await storage.createApiType(validatedData);
      return res.status(201).json(newApiType);
    } catch (error) {
      return res.status(400).json({ message: 'Invalid API type data' });
    }
  });
  
  // Applications routes
  app.get('/api/applications', async (req: Request, res: Response) => {
    const userId = parseInt(req.query.userId as string);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    
    const applications = await storage.getApplications(userId);
    return res.json(applications);
  });
  
  app.get('/api/applications/:id', async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const application = await storage.getApplication(id);
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    return res.json(application);
  });
  
  app.post('/api/applications', async (req: Request, res: Response) => {
    try {
      const validatedData = insertApplicationSchema.parse(req.body);
      const newApplication = await storage.createApplication(validatedData);
      return res.status(201).json(newApplication);
    } catch (error) {
      return res.status(400).json({ message: 'Invalid application data' });
    }
  });
  
  app.put('/api/applications/:id', async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }
    
    const updatedApplication = await storage.updateApplication(id, name, description || '');
    
    if (!updatedApplication) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    return res.json(updatedApplication);
  });
  
  app.delete('/api/applications/:id', async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const success = await storage.deleteApplication(id);
    
    if (!success) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    return res.json({ message: 'Application deleted successfully' });
  });
  
  // API Keys routes
  app.get('/api/applications/:applicationId/api-keys', async (req: Request, res: Response) => {
    const applicationId = parseInt(req.params.applicationId);
    const apiKeys = await storage.getApiKeys(applicationId);
    
    // Fetch API type details for each key
    const keysWithApiTypeDetails = await Promise.all(apiKeys.map(async (key) => {
      const apiType = await storage.getApiType(key.apiTypeId);
      return {
        ...key,
        apiType: apiType
      };
    }));
    
    return res.json(keysWithApiTypeDetails);
  });
  
  app.post('/api/api-keys', async (req: Request, res: Response) => {
    try {
      const validatedData = insertApiKeySchema.parse(req.body);
      const newApiKey = await storage.createApiKey(validatedData);
      
      // Get API type details
      const apiType = await storage.getApiType(newApiKey.apiTypeId);
      
      return res.status(201).json({
        ...newApiKey,
        apiType
      });
    } catch (error) {
      return res.status(400).json({ message: 'Invalid API key data' });
    }
  });
  
  app.put('/api/api-keys/:id/toggle', async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const { isActive } = req.body;
    
    if (isActive === undefined) {
      return res.status(400).json({ message: 'isActive flag is required' });
    }
    
    const updatedApiKey = await storage.toggleApiKey(id, isActive);
    
    if (!updatedApiKey) {
      return res.status(404).json({ message: 'API key not found' });
    }
    
    // Get API type details
    const apiType = await storage.getApiType(updatedApiKey.apiTypeId);
    
    return res.json({
      ...updatedApiKey,
      apiType
    });
  });
  
  app.delete('/api/api-keys/:id', async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const success = await storage.deleteApiKey(id);
    
    if (!success) {
      return res.status(404).json({ message: 'API key not found' });
    }
    
    return res.json({ message: 'API key deleted successfully' });
  });
  
  // Usage Statistics routes
  app.get('/api/statistics/method-stats', async (req: Request, res: Response) => {
    const fromDateStr = req.query.fromDate as string;
    const toDateStr = req.query.toDate as string;
    
    if (!fromDateStr || !toDateStr) {
      return res.status(400).json({ message: 'From and to dates are required' });
    }
    
    const fromDate = new Date(fromDateStr);
    const toDate = new Date(toDateStr);
    
    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' });
    }
    
    const stats = await storage.getMethodStats(fromDate, toDate);
    return res.json(stats);
  });
  
  app.post('/api/statistics/record', async (req: Request, res: Response) => {
    const { apiKeyId, method } = req.body;
    
    if (!apiKeyId || !method) {
      return res.status(400).json({ message: 'API key ID and method are required' });
    }
    
    const stat = await storage.recordUsage(apiKeyId, method);
    return res.status(201).json(stat);
  });
  
  const httpServer = createServer(app);
  return httpServer;
}
