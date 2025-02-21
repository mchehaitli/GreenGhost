import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Route, useLocation } from "wouter";

interface ProtectedRouteProps {
  path: string;
  component: React.ComponentType;
}

export function ProtectedRoute({ path, component: Component }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const [location, setLocation] = useLocation();

  // If we're loading, show a loading spinner
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If there's no user and we're not loading, redirect to login
  if (!user && !isLoading && location !== '/login') {
    setLocation('/login');
    return null;
  }

  // If we have a user, render the protected component
  return (
    <Route path={path}>
      {() => <Component />}
    </Route>
  );
}