import { ReactNode, createContext, useContext } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface SelectUser {
  id: number;
  username: string;
}

interface AuthContextType {
  user: SelectUser | null;
  isLoading: boolean;
  error: Error | null;
  login: (credentials: { username: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

async function fetchJson(input: RequestInfo, init?: RequestInit) {
  const response = await fetch(input, {
    ...init,
    credentials: 'include',
    headers: {
      ...init?.headers,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text);
  }
  return response.json();
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();

  const { data: user, error, isLoading, refetch } = useQuery<SelectUser | null>({
    queryKey: ["/api/user"],
    queryFn: () => 
      fetchJson("/api/user")
        .catch(error => {
          console.log('Auth check failed:', error.message);
          if (error.message.includes("401")) {
            return null;
          }
          throw error;
        }),
    staleTime: 0, // Always check fresh auth state
    gcTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      console.log("Login attempt for:", credentials.username);
      const data = await fetchJson("/api/login", {
        method: "POST",
        body: JSON.stringify(credentials),
      });
      console.log("Login successful for:", credentials.username);
      return data;
    },
    onSuccess: () => {
      console.log("Refetching user data after successful login");
      refetch(); // Immediately refetch user data after successful login
      toast({
        title: "Logged in successfully",
        description: "Welcome back!",
      });
    },
    onError: (error: Error) => {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
      throw error; // Re-throw to be caught by the login form
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      console.log("Logout attempt...");
      await fetchJson("/api/logout", {
        method: "POST",
      });
      console.log("Logout successful");
    },
    onSuccess: () => {
      console.log("Clearing user data after logout");
      refetch(); // Immediately refetch user data after logout
      toast({
        title: "Logged out successfully",
      });
    },
    onError: (error: Error) => {
      console.error("Logout error:", error);
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        isLoading,
        error,
        login: loginMutation.mutateAsync,
        logout: logoutMutation.mutateAsync,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}