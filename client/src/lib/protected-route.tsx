import { useAuth } from "@/hooks/use-auth";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Route, useLocation } from "wouter";

interface ProtectedRouteProps {
  path: string;
  component: React.ComponentType;
}

export function ProtectedRoute({ path, component: Component }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  // Log the current state for debugging
  console.log('ProtectedRoute state:', {
    path,
    isAuthenticated: !!user,
    isLoading
  });

  if (isLoading) {
    return (
      <Route path={path}>
        {() => (
          <div className="flex items-center justify-center min-h-screen">
            <LoadingSpinner size="lg" />
          </div>
        )}
      </Route>
    );
  }

  return (
    <Route path={path}>
      {() => {
        if (!user) {
          // If not authenticated, redirect to login
          setLocation('/login');
          return null;
        }

        console.log(`Authenticated user ${user.username}, rendering ${path}`);
        return <Component />;
      }}
    </Route>
  );
}