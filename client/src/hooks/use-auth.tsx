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

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();

  const { data: user, error, isLoading, refetch } = useQuery<SelectUser | null>({
    queryKey: ["/api/user"],
    queryFn: async () => {
      const response = await fetch("/api/user", {
        credentials: 'include'
      });

      if (!response.ok) {
        if (response.status === 401) {
          return null;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.json();
    },
    retry: false,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: credentials.username,
          password: credentials.password
        }),
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Login failed' }));
        throw new Error(errorData.error || 'Login failed');
      }

      return response.json();
    },
    onSuccess: () => {
      refetch();
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
      const response = await fetch("/api/logout", {
        method: "POST",
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Logout failed');
      }
    },
    onSuccess: () => {
      refetch();
      toast({
        title: "Logged out successfully",
      });
    },
    onError: (error: Error) => {
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