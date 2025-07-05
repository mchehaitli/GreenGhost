import { QueryClient, QueryFunction } from "@tanstack/react-query";

// Get API base URL from environment or default to current origin for development
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export async function apiRequest(
  method: string,
  endpoint: string,
  data?: unknown | undefined,
): Promise<Response> {
  const url = `${API_BASE_URL}${endpoint}`;
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }

  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
    async ({ queryKey }: { queryKey: readonly unknown[] }) => {
      const endpoint = queryKey[0] as string;
      const url = `${API_BASE_URL}${endpoint}`;
      const res = await fetch(url, {
        credentials: "include",
      });

      if (res.status === 401) {
        if (unauthorizedBehavior === "returnNull") {
          return null;
        }
        throw new Error("Not authenticated");
      }

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || res.statusText);
      }
      return await res.json();
    };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: true,
      staleTime: 0,
    },
    mutations: {
      retry: false,
    },
  },
});