import { useState, useEffect } from "react";
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import Home from "@/pages/Home";
import Services from "@/pages/Services";
import Quote from "@/pages/Quote";
import About from "@/pages/About";
import Waitlist from "@/pages/Waitlist";
import ThemeCustomization from "@/pages/ThemeCustomization";
import NotFound from "@/pages/not-found";
import WaitlistDialog from "@/components/WaitlistDialog";
import WaitlistButton from "@/components/WaitlistButton";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/services" component={Services} />
      <Route path="/quote" component={Quote} />
      <Route path="/about" component={About} />
      <Route path="/waitlist" component={Waitlist} />
      <Route path="/theme" component={ThemeCustomization} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [showInitialDialog, setShowInitialDialog] = useState(false);

  useEffect(() => {
    // Show the dialog after a short delay
    const timer = setTimeout(() => {
      // Check if user has already seen the dialog
      const hasSeenDialog = localStorage.getItem('hasSeenWaitlistDialog');
      if (!hasSeenDialog) {
        setShowInitialDialog(true);
        localStorage.setItem('hasSeenWaitlistDialog', 'true');
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-grow">
          <Router />
        </main>
        <Footer />
        <WaitlistDialog 
          open={showInitialDialog} 
          onOpenChange={setShowInitialDialog}
        />
        <WaitlistButton />
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;