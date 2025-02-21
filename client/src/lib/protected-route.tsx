import { useAuth } from "@/hooks/use-auth";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Redirect } from "wouter";
import { useEffect } from "react";

interface ProtectedRouteProps {
  component: React.ComponentType;
}

export function ProtectedRoute({ component: Component }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      console.log("No authenticated user, redirecting to login");
    }
  }, [user, isLoading]);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!user) {
    return <Redirect to="/login" />;
  }

  // If authenticated, render the protected component
  return <Component />;
}