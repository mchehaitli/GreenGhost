
import React, { useState, useEffect } from 'react';
import { useLocation, Redirect } from 'wouter';
import { useAuth } from './auth';
import { LoadingSpinner } from '../components/ui/loading-spinner';

interface ProtectedRouteProps {
  component: React.ComponentType;
}

export function ProtectedRoute({ component: Component }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [authChecked, setAuthChecked] = useState(false);
  const currentPath = window.location.pathname;

  // Check authentication status when the component mounts or when auth state changes
  useEffect(() => {
    if (!isLoading) {
      setAuthChecked(true);
      if (!user) {
        // If not loading and no user is found, redirect to login
        const redirectPath = `/login?redirect=${encodeURIComponent(currentPath)}`;
        console.log(`Authentication required, redirecting to: ${redirectPath}`);
        setLocation(redirectPath);
      }
    }
  }, [user, isLoading, setLocation, currentPath]);

  // Show loading spinner while checking authentication
  if (isLoading || !authChecked) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <LoadingSpinner size="lg" />
          <p className="text-muted-foreground">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!user) {
    console.log("User not authenticated, redirecting to login");
    return <Redirect to={`/login?redirect=${encodeURIComponent(currentPath)}`} />;
  }

  // If authenticated, render the protected component
  console.log("User authenticated, rendering protected component");
  return <Component />;
}
