import { pgTable, text, serial, integer, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Role enum for team members
export const roleEnum = pgEnum('role', ['admin', 'member', 'viewer']);

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
});

// Team members schema
export const teamMembers = pgTable("team_members", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  role: roleEnum("role").notNull().default('member'),
  domain: text("domain").notNull(),
});

export const insertTeamMemberSchema = createInsertSchema(teamMembers).pick({
  userId: true,
  role: true,
  domain: true,
});

// API Types schema
export const apiTypes = pgTable("api_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  methods: text("methods").array().notNull(),
});

export const insertApiTypeSchema = createInsertSchema(apiTypes).pick({
  name: true,
  description: true,
  methods: true,
});

// Applications schema
export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  appId: text("app_id").notNull().unique(),
  userId: integer("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertApplicationSchema = createInsertSchema(applications).pick({
  name: true,
  description: true,
  userId: true,
});

// API Keys schema
export const apiKeys = pgTable("api_keys", {
  id: serial("id").primaryKey(),
  applicationId: integer("application_id").notNull().references(() => applications.id),
  apiTypeId: integer("api_type_id").notNull().references(() => apiTypes.id),
  key: text("key").notNull().unique(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertApiKeySchema = createInsertSchema(apiKeys).pick({
  applicationId: true,
  apiTypeId: true,
});

// Usage Statistics schema
export const usageStats = pgTable("usage_stats", {
  id: serial("id").primaryKey(),
  apiKeyId: integer("api_key_id").notNull().references(() => apiKeys.id),
  method: text("method").notNull(),
  count: integer("count").notNull().default(0),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const insertUsageStatSchema = createInsertSchema(usageStats).pick({
  apiKeyId: true,
  method: true,
  count: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type TeamMember = typeof teamMembers.$inferSelect;
export type InsertTeamMember = z.infer<typeof insertTeamMemberSchema>;

export type ApiType = typeof apiTypes.$inferSelect;
export type InsertApiType = z.infer<typeof insertApiTypeSchema>;

export type Application = typeof applications.$inferSelect;
export type InsertApplication = z.infer<typeof insertApplicationSchema>;

export type ApiKey = typeof apiKeys.$inferSelect;
export type InsertApiKey = z.infer<typeof insertApiKeySchema>;

export type UsageStat = typeof usageStats.$inferSelect;
export type InsertUsageStat = z.infer<typeof insertUsageStatSchema>;
