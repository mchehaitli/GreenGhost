
import { useAuth } from "@/hooks/use-auth";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Redirect, useLocation } from "wouter";
import { useEffect } from "react";

interface ProtectedRouteProps {
  component: React.ComponentType;
}

export function ProtectedRoute({ component: Component }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      const currentPath = window.location.pathname;
      setLocation(`/login?redirect=${encodeURIComponent(currentPath)}`);
    }
  }, [user, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    // Immediately redirect if not authenticated
    return <Redirect to="/login" />;
  }

  return <Component />;
}
