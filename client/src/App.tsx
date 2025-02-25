import { useState } from "react";
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import Home from "@/pages/Home";
import Services from "@/pages/Services";
import Quote from "@/pages/Quote";
import About from "@/pages/About";
import Waitlist from "@/pages/Waitlist";
import AdminWaitlist from "@/pages/admin/Waitlist";
import ThemeCustomization from "@/pages/ThemeCustomization";
import HowItWorks from "@/pages/HowItWorks";
import Blog from "@/pages/Blog";
import BlogPost from "@/pages/BlogPost";
import Pricing from "@/pages/Pricing";
import NotFound from "@/pages/not-found";
import WaitlistDialog from "@/components/WaitlistDialog";
import Login from "@/pages/Login";
import { ProtectedRoute } from "@/lib/protected-route";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/services" component={Services} />
      <Route path="/how-it-works" component={HowItWorks} />
      <Route path="/blog" component={Blog} />
      <Route path="/blog/:slug" component={BlogPost} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/quote" component={Quote} />
      <Route path="/about" component={About} />
      <Route path="/waitlist" component={Waitlist} />
      <Route path="/theme" component={ThemeCustomization} />
      <Route path="/login" component={Login} />
      <Route path="/admin/waitlist" component={() => <ProtectedRoute component={AdminWaitlist} />} />
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