import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  body?: any,
  extraHeaders?: Record<string, string>
): Promise<Response> {
  const headers = new Headers();
  
  const clientId = localStorage.getItem("x-client-id");
  if (clientId) {
    headers.append("x-client-id", clientId);
  }

  // Solo agregar Content-Type si hay body
  if (body) {
    headers.append("Content-Type", "application/json");
  }

  // Agregar headers adicionales si existen
  if (extraHeaders) {
    Object.entries(extraHeaders).forEach(([key, value]) => {
      headers.append(key, value);
    });
  }

  const requestOptions = {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  };

  console.log("Request:", {
    method,
    url: `http://127.0.0.1:8000${url}`,
    headers: Object.fromEntries(headers.entries()),
    body: body ? JSON.stringify(body) : undefined
  });

  const response = await fetch(`http://127.0.0.1:8000${url}`, requestOptions);
  
  // Clonar la respuesta para poder leerla dos veces
  const responseClone = response.clone();
  try {
    const text = await responseClone.text();
    console.log("Response:", text);
  } catch (error) {
    console.error("Error reading response:", error);
  }

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response;
}


type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const headers = new Headers();
    const clientId = localStorage.getItem("x-client-id");
    if (clientId) {
      headers.append("x-client-id", clientId);
    }

    const res = await fetch(queryKey[0] as string, {
      headers
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
