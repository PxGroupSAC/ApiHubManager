import { getToken } from "./auth";

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const token = getToken();
  const clientId = localStorage.getItem("x-client-id");

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(clientId ? { "x-client-id": clientId } : {}),
    ...options.headers,
  };

  const response = await fetch(`http://127.0.0.1:8000${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || "An error occurred");
  }

  return response;
} 