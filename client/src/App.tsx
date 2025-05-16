import { useState } from "react";
import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import Navigation from "@/components/NavigationOriginal";
import Footer from "@/components/Footer";
import Home from "@/pages/Home";
import Services from "@/pages/Services";
import Quote from "@/pages/Quote";
import About from "@/pages/About";
import Waitlist from "@/pages/Waitlist";
import AdminPortal from "./pages/admin/AdminPortal";
import Settings from "@/pages/Settings";
import ThemeCustomization from "@/pages/ThemeCustomization";
import Blog from "@/pages/Blog";
import BlogPost from "@/pages/BlogPost";
import Pricing from "@/pages/Pricing";
import AIReview from "@/pages/AIReview";
import CaptureScreenshots from "@/pages/CaptureScreenshots";
import NotFound from "@/pages/not-found";
import WaitlistDialog from "@/components/WaitlistDialog";
import Login from "@/pages/Login";
import { ProtectedRoute } from "@/lib/protected-route";

// Helper for protected routes that preserves component type
const ProtectedRouteWrapper = ({ component }: { component: React.ComponentType }) => (
  <ProtectedRoute component={component} />
);

function Router() {
  const [location] = useLocation();

  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/services" component={Services} />
      <Route path="/blog" component={Blog} />
      <Route path="/blog/:slug" component={BlogPost} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/quote" component={Quote} />
      <Route path="/about" component={About} />
      <Route path="/waitlist" component={Waitlist} />
      <Route path="/theme" component={ThemeCustomization} />
      <Route path="/login" component={Login} />
      <Route path="/admin">
        <ProtectedRouteWrapper component={AdminPortal} />
      </Route>
      <Route path="/admin/ai-review">
        <ProtectedRouteWrapper component={AIReview} />
      </Route>
      <Route path="/admin/capture">
        <ProtectedRouteWrapper component={CaptureScreenshots} />
      </Route>
      <Route path="/settings">
        <ProtectedRouteWrapper component={Settings} />
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [showWaitlist, setShowWaitlist] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="min-h-screen flex flex-col">
          <Navigation />
          <main className="flex-grow">
            <Router />
          </main>
          <Footer />
          <WaitlistDialog open={showWaitlist} onOpenChange={setShowWaitlist} />
        </div>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
