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
  body?: any
): Promise<Response> {
  const headers = new Headers();
  headers.append("Content-Type", "application/json");
  headers.append("Accept", "application/json");
  headers.append("Access-Control-Allow-Origin", "*");
  headers.append("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  headers.append("Access-Control-Allow-Headers", "Content-Type, Authorization, x-client-id");

  const clientId = localStorage.getItem("x-client-id");
  if (clientId) {
    headers.append("x-client-id", clientId);
  }

  const requestOptions = {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    mode: "cors" as const,
    credentials: "include" as const
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
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
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
