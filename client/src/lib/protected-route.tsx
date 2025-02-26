
import { useAuth } from "@/hooks/use-auth";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Redirect, useLocation } from "wouter";
import { useEffect } from "react";

interface ProtectedRouteProps {
  component: React.ComponentType;
}

export function ProtectedRoute({ component: Component }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const currentPath = window.location.pathname;

  // Check authentication status when the component mounts or when auth state changes
  useEffect(() => {
    if (!isLoading && !user) {
      // If not loading and no user is found, redirect to login
      setLocation(`/login?redirect=${encodeURIComponent(currentPath)}`);
    }
  }, [user, isLoading, setLocation, currentPath]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!user) {
    return <Redirect to={`/login?redirect=${encodeURIComponent(currentPath)}`} />;
  }

  // If authenticated, render the protected component
  return <Component />;
}
