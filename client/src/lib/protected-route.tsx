import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Route, useLocation } from "wouter";
import { useEffect } from "react";

interface ProtectedRouteProps {
  path: string;
  component: React.ComponentType;
}

export function ProtectedRoute({ path, component: Component }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  // Force redirect if not authenticated
  useEffect(() => {
    if (!user && !isLoading) {
      setLocation('/login');
    }
  }, [user, isLoading, setLocation]);

  // Don't render anything while checking auth
  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Route>
    );
  }

  // If not authenticated, don't render anything - useEffect will handle redirect
  if (!user) {
    return null;
  }

  // Only render component if authenticated
  return (
    <Route path={path}>
      <Component />
    </Route>
  );
}