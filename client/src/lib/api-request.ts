export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const clientId = localStorage.getItem("x-client-id");

  const headers: HeadersInit = {
    ...(options.body || options.method === 'POST' || options.method === 'PUT' 
      ? { "Content-Type": "application/json" } 
      : {}),
    ...(clientId && endpoint !== '/login' ? { "x-client-id": clientId } : {}),
    ...options.headers,
  };

  console.log('=== REQUEST DETAILS ===');
  console.log('URL:', `http://127.0.0.1:8000${endpoint}`);
  console.log('Method:', options.method || 'GET');
  console.log('Headers:', headers);
  console.log('Body:', options.body);
  console.log('=====================');

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