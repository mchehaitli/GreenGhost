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

  // Immediately redirect to login if not authenticated
  useEffect(() => {
    if (!user && !isLoading) {
      console.log("No authenticated user found, redirecting to login");
      setLocation('/login');
    }
  }, [user, isLoading, setLocation]);

  return (
    <Route path={path}>
      {() => {
        // If still loading auth state, show loading spinner
        if (isLoading) {
          return (
            <div className="flex items-center justify-center min-h-screen">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          );
        }

        // If no user and not loading, don't render anything (useEffect will handle redirect)
        if (!user) {
          console.log("Protected route: No authenticated user");
          return null;
        }

        // If we have a user, render the protected component
        console.log("Protected route: Rendering protected component");
        return <Component />;
      }}
    </Route>
  );
}