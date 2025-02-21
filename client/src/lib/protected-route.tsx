import { useAuth } from "@/hooks/use-auth";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useLocation } from "wouter";

interface ProtectedRouteProps {
  path: string;
  component: React.ComponentType;
}

export function ProtectedRoute({ path, component: Component }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const [location, setLocation] = useLocation();

  // Log the current state for debugging
  console.log('ProtectedRoute state:', {
    path,
    currentLocation: location,
    isAuthenticated: !!user,
    isLoading
  });

  // If still loading, show loading spinner
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // If not authenticated and done loading, redirect to login
  if (!user) {
    console.log('User not authenticated, redirecting to login');
    // Use setTimeout to ensure the redirect happens after the current render cycle
    setTimeout(() => setLocation('/login'), 0);
    return null;
  }

  // If authenticated, render the protected component
  console.log(`Authenticated user ${user.username}, rendering ${path}`);
  return <Component />;
}