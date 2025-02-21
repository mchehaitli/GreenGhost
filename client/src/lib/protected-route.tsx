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

  useEffect(() => {
    // Redirect to login if not authenticated and not currently loading
    if (!user && !isLoading) {
      setLocation('/login');
    }
  }, [user, isLoading, setLocation]);

  return (
    <Route path={path}>
      {() => {
        // Show loading state while checking auth
        if (isLoading) {
          return (
            <div className="flex items-center justify-center min-h-screen">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          );
        }

        // If not authenticated, render nothing (useEffect will handle redirect)
        if (!user) {
          return null;
        }

        // If authenticated, render the protected component
        return <Component />;
      }}
    </Route>
  );
}