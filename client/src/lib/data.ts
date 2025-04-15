import { ApiType, Application, ApiKey, TeamMember } from "@shared/schema";

// Default user ID (would normally come from auth)
export const CURRENT_USER_ID = 1;
export const DOMAIN = "fiajero-group.com";

// Types with expanded relationships
export interface ApplicationWithApiKeys extends Application {
  apiKeys?: (ApiKey & { apiType?: ApiType })[];
}

export interface TeamMemberWithUser extends TeamMember {
  username?: string;
  email?: string;
}

// Date formatting
export function formatStatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZoneName: 'short'
  }).format(date);
}

// API helpers
export function getApplicationWithApiKeys(appId: number): Promise<ApplicationWithApiKeys> {
  return fetch(`/api/applications/${appId}`)
    .then(res => res.json())
    .then(async (app) => {
      const apiKeysRes = await fetch(`/api/applications/${appId}/api-keys`);
      const apiKeys = await apiKeysRes.json();
      return { ...app, apiKeys };
    });
}

export function createApiKey(applicationId: number, apiTypeId: number): Promise<ApiKey & { apiType?: ApiType }> {
  return fetch('/api/api-keys', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ applicationId, apiTypeId })
  }).then(res => res.json());
}

export function toggleApiKey(id: number, isActive: boolean): Promise<ApiKey & { apiType?: ApiType }> {
  return fetch(`/api/api-keys/${id}/toggle`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ isActive })
  }).then(res => res.json());
}

export function deleteApiKey(id: number): Promise<{ message: string }> {
  return fetch(`/api/api-keys/${id}`, {
    method: 'DELETE'
  }).then(res => res.json());
}

export function fetchMethodStats(fromDate: Date, toDate: Date): Promise<{ 
  method: string; 
  from: Date; 
  to: Date; 
  traffic: number;
}[]> {
  return fetch(`/api/statistics/method-stats?fromDate=${fromDate.toISOString()}&toDate=${toDate.toISOString()}`)
    .then(res => res.json())
    .then(data => data.map((item: any) => ({
      ...item,
      from: new Date(item.from),
      to: new Date(item.to)
    })));
}

// Time period options for statistics
export const TIME_PERIODS = [
  { label: '24 hours', value: '24h' },
  { label: '7 days', value: '7d' },
  { label: '30 days', value: '30d' },
  { label: '3 months', value: '3m' }
];

export const INTERVAL_OPTIONS = [
  { label: 'hour', value: 'hour' },
  { label: 'day', value: 'day' },
  { label: 'week', value: 'week' },
  { label: 'month', value: 'month' }
];

// Calculate date range based on time period
export function getDateRange(period: string): { fromDate: Date, toDate: Date } {
  const toDate = new Date();
  const fromDate = new Date();
  
  switch (period) {
    case '24h':
      fromDate.setDate(fromDate.getDate() - 1);
      break;
    case '7d':
      fromDate.setDate(fromDate.getDate() - 7);
      break;
    case '30d':
      fromDate.setDate(fromDate.getDate() - 30);
      break;
    case '3m':
      fromDate.setMonth(fromDate.getMonth() - 3);
      break;
  }
  
  return { fromDate, toDate };
}
