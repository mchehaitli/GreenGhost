import { useAuth } from "@/hooks/use-auth";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Route, Redirect } from "wouter";

interface ProtectedRouteProps {
  path: string;
  component: React.ComponentType;
}

export function ProtectedRoute({ path, component: Component }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  console.log('ProtectedRoute state:', { path, isAuthenticated: !!user, isLoading });

  return (
    <Route path={path}>
      {() => {
        // If still loading auth state, show loading spinner
        if (isLoading) {
          return (
            <div className="flex items-center justify-center min-h-screen">
              <LoadingSpinner size="lg" />
            </div>
          );
        }

        // If no user and not loading, redirect to login
        if (!user) {
          console.log(`Not authenticated, redirecting to login from ${path}`);
          return <Redirect to="/login" />;
        }

        // If we have a user, render the protected component
        console.log(`Authenticated user ${user.username}, rendering ${path}`);
        return <Component />;
      }}
    </Route>
  );
}