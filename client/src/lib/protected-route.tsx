import { useAuth } from "@/hooks/use-auth";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Redirect } from "wouter";

interface ProtectedRouteProps {
  path: string;
  component: React.ComponentType;
}

export function ProtectedRoute({ component: Component }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  console.log('ProtectedRoute: auth state', { user, isLoading });

  // Show loading state while checking auth
  if (isLoading) {
    console.log('ProtectedRoute: Loading auth state...');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // If no user is found after loading, redirect to login
  if (!user) {
    console.log('ProtectedRoute: No authenticated user, redirecting to login');
    return <Redirect to="/login" />;
  }

  console.log('ProtectedRoute: User authenticated, rendering protected component');
  // If we have a user, render the protected component
  return <Component />;
}