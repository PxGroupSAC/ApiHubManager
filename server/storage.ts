import { v4 as uuidv4 } from 'uuid';
import { 
  users, User, InsertUser,
  teamMembers, TeamMember, InsertTeamMember,
  apiTypes, ApiType, InsertApiType,
  applications, Application, InsertApplication,
  apiKeys, ApiKey, InsertApiKey,
  usageStats, UsageStat, InsertUsageStat
} from "@shared/schema";
import createMemoryStore from "memorystore";
import session from "express-session";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Team operations
  getTeamMembers(domain: string): Promise<TeamMember[]>;
  addTeamMember(member: InsertTeamMember): Promise<TeamMember>;
  updateTeamMember(id: number, role: string): Promise<TeamMember | undefined>;
  
  // API Types operations
  getApiTypes(): Promise<ApiType[]>;
  getApiType(id: number): Promise<ApiType | undefined>;
  createApiType(apiType: InsertApiType): Promise<ApiType>;
  
  // Applications operations
  getApplications(userId: number): Promise<Application[]>;
  getApplication(id: number): Promise<Application | undefined>;
  getApplicationByAppId(appId: string): Promise<Application | undefined>;
  createApplication(app: InsertApplication): Promise<Application>;
  updateApplication(id: number, name: string, description: string): Promise<Application | undefined>;
  deleteApplication(id: number): Promise<boolean>;
  
  // API Keys operations
  getApiKeys(applicationId: number): Promise<ApiKey[]>;
  getApiKey(id: number): Promise<ApiKey | undefined>;
  createApiKey(apiKey: InsertApiKey): Promise<ApiKey>;
  toggleApiKey(id: number, isActive: boolean): Promise<ApiKey | undefined>;
  deleteApiKey(id: number): Promise<boolean>;
  
  // Usage Statistics operations
  getUsageStats(apiKeyId: number, fromDate: Date, toDate: Date): Promise<UsageStat[]>;
  getMethodStats(fromDate: Date, toDate: Date): Promise<{method: string, from: Date, to: Date, traffic: number}[]>;
  recordUsage(apiKeyId: number, method: string): Promise<UsageStat>;
  
  // Session store for authentication
  sessionStore: any;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private teamMembers: Map<number, TeamMember>;
  private apiTypes: Map<number, ApiType>;
  private applications: Map<number, Application>;
  private apiKeys: Map<number, ApiKey>;
  private usageStats: Map<number, UsageStat>;
  
  private userId: number = 1;
  private teamMemberId: number = 1;
  private apiTypeId: number = 1;
  private applicationId: number = 1;
  private apiKeyId: number = 1;
  private usageStatId: number = 1;
  
  public sessionStore: any;
  
  constructor() {
    this.users = new Map();
    this.teamMembers = new Map();
    this.apiTypes = new Map();
    this.applications = new Map();
    this.apiKeys = new Map();
    this.usageStats = new Map();
    
    // Initialize memory store for sessions
    const MemoryStore = createMemoryStore(session);
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // 24 hours
    });
    
    // Initialize with some default data
    this.initializeDefaultData();
  }
  
  private initializeDefaultData() {
    // Create a default user
    const user: User = {
      id: this.userId++,
      username: 'admin',
      email: 'admin@fiajero-group.com',
      password: 'admin'
    };
    this.users.set(user.id, user);
    
    // Create a default team member
    const teamMember: TeamMember = {
      id: this.teamMemberId++,
      userId: user.id,
      role: 'admin',
      domain: 'fiajero-group.com'
    };
    this.teamMembers.set(teamMember.id, teamMember);
    
    // Create default API types
    const authApiType: ApiType = {
      id: this.apiTypeId++,
      name: 'Authentication API',
      description: 'User verification and authentication services',
      methods: ['login', 'verify', 'logout', 'refresh']
    };
    this.apiTypes.set(authApiType.id, authApiType);
    
    const mediaApiType: ApiType = {
      id: this.apiTypeId++,
      name: 'Media Processing API',
      description: 'Image/video transformation and storage',
      methods: ['upload', 'transform', 'delete', 'get', 'list']
    };
    this.apiTypes.set(mediaApiType.id, mediaApiType);
    
    const recognitionApiType: ApiType = {
      id: this.apiTypeId++,
      name: 'Recognition API',
      description: 'Computer vision and object detection',
      methods: ['detect', 'recognize', 'classify', 'analyze']
    };
    this.apiTypes.set(recognitionApiType.id, recognitionApiType);
    
    // Create default applications
    const app1: Application = {
      id: this.applicationId++,
      name: 'fiajero-group.com\'s App',
      description: 'Description of your default application',
      appId: 'cbaf7619',
      userId: user.id,
      createdAt: new Date()
    };
    this.applications.set(app1.id, app1);
    
    const app2: Application = {
      id: this.applicationId++,
      name: 'test1',
      description: 'testing api',
      appId: '3694db32',
      userId: user.id,
      createdAt: new Date()
    };
    this.applications.set(app2.id, app2);
    
    const app3: Application = {
      id: this.applicationId++,
      name: 'Desarrollo',
      description: 'Javier / Sato',
      appId: 'd9e5da91',
      userId: user.id,
      createdAt: new Date()
    };
    this.applications.set(app3.id, app3);
    
    const app4: Application = {
      id: this.applicationId++,
      name: 'pruebas',
      description: 'prueba ofics',
      appId: 'fdc05ef3',
      userId: user.id,
      createdAt: new Date()
    };
    this.applications.set(app4.id, app4);
    
    // Create default API keys
    const key1: ApiKey = {
      id: this.apiKeyId++,
      applicationId: app1.id,
      apiTypeId: authApiType.id,
      key: 'e30e4123fc3c3e64c15ae2a7e3f5e40',
      isActive: true,
      createdAt: new Date()
    };
    this.apiKeys.set(key1.id, key1);
    
    const key2: ApiKey = {
      id: this.apiKeyId++,
      applicationId: app2.id,
      apiTypeId: mediaApiType.id,
      key: '60ded99082068d4ebef0e9a55367b2b',
      isActive: true,
      createdAt: new Date()
    };
    this.apiKeys.set(key2.id, key2);
    
    const key3: ApiKey = {
      id: this.apiKeyId++,
      applicationId: app3.id,
      apiTypeId: recognitionApiType.id,
      key: '12e9c2cd7dbee09979a2da5355669d',
      isActive: true,
      createdAt: new Date()
    };
    this.apiKeys.set(key3.id, key3);
    
    const key4: ApiKey = {
      id: this.apiKeyId++,
      applicationId: app4.id,
      apiTypeId: authApiType.id,
      key: '3c3c0bfc35867fde02559bf5cf0fe8af',
      isActive: true,
      createdAt: new Date()
    };
    this.apiKeys.set(key4.id, key4);
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Team operations
  async getTeamMembers(domain: string): Promise<TeamMember[]> {
    return Array.from(this.teamMembers.values()).filter(
      (member) => member.domain === domain,
    );
  }
  
  async addTeamMember(insertMember: InsertTeamMember): Promise<TeamMember> {
    const id = this.teamMemberId++;
    const member: TeamMember = { ...insertMember, id };
    this.teamMembers.set(id, member);
    return member;
  }
  
  async updateTeamMember(id: number, role: string): Promise<TeamMember | undefined> {
    const member = this.teamMembers.get(id);
    if (!member) return undefined;
    
    const updatedMember: TeamMember = { ...member, role: role as any };
    this.teamMembers.set(id, updatedMember);
    return updatedMember;
  }
  
  // API Types operations
  async getApiTypes(): Promise<ApiType[]> {
    return Array.from(this.apiTypes.values());
  }
  
  async getApiType(id: number): Promise<ApiType | undefined> {
    return this.apiTypes.get(id);
  }
  
  async createApiType(insertApiType: InsertApiType): Promise<ApiType> {
    const id = this.apiTypeId++;
    const apiType: ApiType = { ...insertApiType, id };
    this.apiTypes.set(id, apiType);
    return apiType;
  }
  
  // Applications operations
  async getApplications(userId: number): Promise<Application[]> {
    return Array.from(this.applications.values()).filter(
      (app) => app.userId === userId,
    );
  }
  
  async getApplication(id: number): Promise<Application | undefined> {
    return this.applications.get(id);
  }
  
  async getApplicationByAppId(appId: string): Promise<Application | undefined> {
    return Array.from(this.applications.values()).find(
      (app) => app.appId === appId,
    );
  }
  
  async createApplication(insertApp: InsertApplication): Promise<Application> {
    const id = this.applicationId++;
    const appId = Math.random().toString(16).substring(2, 10);
    const app: Application = { 
      ...insertApp, 
      id, 
      appId,
      createdAt: new Date()
    };
    this.applications.set(id, app);
    return app;
  }
  
  async updateApplication(id: number, name: string, description: string): Promise<Application | undefined> {
    const app = this.applications.get(id);
    if (!app) return undefined;
    
    const updatedApp: Application = { ...app, name, description };
    this.applications.set(id, updatedApp);
    return updatedApp;
  }
  
  async deleteApplication(id: number): Promise<boolean> {
    // Also delete associated API keys
    const apiKeysToDelete = Array.from(this.apiKeys.values()).filter(
      (key) => key.applicationId === id,
    );
    
    for (const key of apiKeysToDelete) {
      await this.deleteApiKey(key.id);
    }
    
    return this.applications.delete(id);
  }
  
  // API Keys operations
  async getApiKeys(applicationId: number): Promise<ApiKey[]> {
    return Array.from(this.apiKeys.values()).filter(
      (key) => key.applicationId === applicationId,
    );
  }
  
  async getApiKey(id: number): Promise<ApiKey | undefined> {
    return this.apiKeys.get(id);
  }
  
  async createApiKey(insertApiKey: InsertApiKey): Promise<ApiKey> {
    const id = this.apiKeyId++;
    const key = this.generateApiKey();
    const apiKey: ApiKey = { 
      ...insertApiKey, 
      id, 
      key,
      isActive: true,
      createdAt: new Date()
    };
    this.apiKeys.set(id, apiKey);
    return apiKey;
  }
  
  async toggleApiKey(id: number, isActive: boolean): Promise<ApiKey | undefined> {
    const apiKey = this.apiKeys.get(id);
    if (!apiKey) return undefined;
    
    const updatedApiKey: ApiKey = { ...apiKey, isActive };
    this.apiKeys.set(id, updatedApiKey);
    return updatedApiKey;
  }
  
  async deleteApiKey(id: number): Promise<boolean> {
    // Also delete associated usage statistics
    const statsToDelete = Array.from(this.usageStats.values()).filter(
      (stat) => stat.apiKeyId === id,
    );
    
    for (const stat of statsToDelete) {
      this.usageStats.delete(stat.id);
    }
    
    return this.apiKeys.delete(id);
  }
  
  // Usage Statistics operations
  async getUsageStats(apiKeyId: number, fromDate: Date, toDate: Date): Promise<UsageStat[]> {
    return Array.from(this.usageStats.values()).filter(
      (stat) => stat.apiKeyId === apiKeyId && 
                stat.timestamp >= fromDate && 
                stat.timestamp <= toDate
    );
  }
  
  async getMethodStats(fromDate: Date, toDate: Date): Promise<{method: string, from: Date, to: Date, traffic: number}[]> {
    const allStats = Array.from(this.usageStats.values()).filter(
      (stat) => stat.timestamp >= fromDate && stat.timestamp <= toDate
    );
    
    const methodMap = new Map<string, number>();
    
    for (const stat of allStats) {
      const currentCount = methodMap.get(stat.method) || 0;
      methodMap.set(stat.method, currentCount + stat.count);
    }
    
    const result: {method: string, from: Date, to: Date, traffic: number}[] = [];
    
    // Add transaction total
    let totalTraffic = 0;
    methodMap.forEach((value) => {
      totalTraffic += value;
    });
    
    result.push({
      method: 'Transactions',
      from: fromDate,
      to: toDate,
      traffic: totalTraffic
    });
    
    // Add individual methods
    methodMap.forEach((traffic, method) => {
      result.push({
        method,
        from: fromDate,
        to: toDate,
        traffic
      });
    });
    
    return result;
  }
  
  async recordUsage(apiKeyId: number, method: string): Promise<UsageStat> {
    const id = this.usageStatId++;
    const stat: UsageStat = {
      id,
      apiKeyId,
      method,
      count: 1,
      timestamp: new Date()
    };
    this.usageStats.set(id, stat);
    return stat;
  }
  
  private generateApiKey(): string {
    return uuidv4().replace(/-/g, '').substring(0, 32);
  }
}

export const storage = new MemStorage();
