import { useAuth } from "@/hooks/use-auth";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Route, Redirect } from "wouter";
import { useEffect } from "react";

interface ProtectedRouteProps {
  path: string;
  component: React.ComponentType;
}

export function ProtectedRoute({ path, component: Component }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner size="lg" />
        </div>
      </Route>
    );
  }

  return (
    <Route path={path}>
      {() => {
        if (!user) {
          console.log('ProtectedRoute: No authenticated user, redirecting to login');
          return <Redirect to="/login" />;
        }

        console.log('ProtectedRoute: User authenticated, rendering component');
        return <Component />;
      }}
    </Route>
  );
}