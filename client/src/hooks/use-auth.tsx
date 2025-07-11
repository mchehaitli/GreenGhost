import { ReactNode, createContext, useContext, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

// Get API base URL from environment or detect production environment
const getApiBaseUrl = () => {
  // If explicitly set in environment, use that
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // For production (greenghost.io), use the backend URL
  if (window.location.hostname === 'greenghost.io') {
    return 'https://greenghosttech-backend.onrender.com';
  }
  
  // For development (Replit, localhost), use relative URLs (empty string)
  return '';
};

const API_BASE_URL = getApiBaseUrl();

interface SelectUser {
  id: number;
  username: string;
  is_admin?: boolean;
  created_at?: string;
}

interface AuthContextType {
  user: SelectUser | null;
  isLoading: boolean;
  error: Error | null;
  login: (credentials: { username: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Set up the authentication query
  const { 
    data: user, 
    error, 
    isLoading, 
    refetch, 
    status,
    isError
  } = useQuery<SelectUser | null>({
    queryKey: ["/api/user"],
    queryFn: async () => {
      console.log("Fetching user auth data...");
      try {
        const response = await fetch(`${API_BASE_URL}/api/user`, {
          credentials: 'include',  // Important: Include credentials in all requests
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }
        });

        console.log(`Auth response status: ${response.status}`);

        if (!response.ok) {
          if (response.status === 401) {
            console.log("User not authenticated");
            return null;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const userData = await response.json();
        console.log("User authenticated:", userData);
        return userData;
      } catch (err) {
        console.error("Auth query error:", err);
        throw err;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  // Log authentication state changes for debugging
  useEffect(() => {
    console.log("Auth state:", { 
      status, 
      isLoading, 
      isError, 
      user: user ? `User ${user.username}` : 'No user',
      apiBaseUrl: API_BASE_URL,
      hostname: window.location.hostname
    });
  }, [status, isLoading, isError, user]);

  const loginMutation = useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: "POST",
        credentials: 'include', // Important: Include credentials
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Login failed' }));
        throw new Error(errorData.error || 'Login failed');
      }

      const userData = await response.json();
      
      // Force invalidate and refetch the user data after successful login
      await queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      await refetch();

      return userData;
    },
    onSuccess: () => {
      toast({
        title: "Logged in successfully",
        description: "Welcome back!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      console.log('Starting logout mutation...');
      const response = await fetch(`${API_BASE_URL}/api/logout`, {
        method: "POST",
        credentials: 'include' // Important: Include credentials
      });

      console.log('Logout response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Logout failed:', errorText);
        throw new Error(`Logout failed: ${errorText}`);
      }

      // Clear all query cache to ensure clean logout
      console.log('Clearing query cache...');
      queryClient.clear();
      // Specifically clear user data
      queryClient.setQueryData(["/api/user"], null);
      
      console.log('Logout mutation completed successfully');
      return response;
    },
    onSuccess: () => {
      console.log('Logout onSuccess called');
      // Force a refetch after clearing cache to ensure we get null/unauthenticated state
      setTimeout(() => {
        console.log('Refetching user data...');
        refetch();
      }, 100);
      
      toast({
        title: "Logged out successfully",
      });
    },
    onError: (error: Error) => {
      console.error('Logout onError called:', error);
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
        error: error instanceof Error ? error : null,
        login: loginMutation.mutateAsync,
        logout: async () => {
          await logoutMutation.mutateAsync();
        },
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