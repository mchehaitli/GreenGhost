import { useAuth } from "@/hooks/use-auth";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Route, Redirect } from "wouter";

interface ProtectedRouteProps {
  path: string;
  component: React.ComponentType;
}

export function ProtectedRoute({ path, component: Component }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  return (
    <Route path={path}>
      {() => {
        if (isLoading) {
          return (
            <div className="flex items-center justify-center min-h-screen">
              <LoadingSpinner size="lg" />
            </div>
          );
        }

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