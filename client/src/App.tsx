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
  // Initialize state for dialog visibility
  const [showDialog, setShowDialog] = useState<boolean>(false);

  useEffect(() => {
    // Check if we're in the browser environment
    if (typeof window === 'undefined') return;

    // Create a timeout to show the dialog after 3 seconds
    const timeoutId = setTimeout(() => {
      // Check if the user has seen the dialog before
      const hasSeenDialog = window.localStorage.getItem('hasSeenWaitlistDialog');

      if (!hasSeenDialog) {
        setShowDialog(true);
      }
    }, 3000);

    // Cleanup function to clear the timeout
    return () => {
      clearTimeout(timeoutId);
    };
  }, []); // Empty dependency array means this runs once on mount

  // Handler for dialog state changes
  const handleDialogChange = (open: boolean) => {
    setShowDialog(open);
    if (!open) {
      // When dialog is closed, mark it as seen
      window.localStorage.setItem('hasSeenWaitlistDialog', 'true');
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-grow">
          <Router />
        </main>
        <Footer />
        <WaitlistDialog 
          open={showDialog} 
          onOpenChange={handleDialogChange}
        />
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;