import { useState } from "react";
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
import AdminWaitlist from "@/pages/admin/Waitlist";
import ThemeCustomization from "@/pages/ThemeCustomization";
import HowItWorks from "@/pages/HowItWorks";
import NotFound from "@/pages/not-found";
import WaitlistDialog from "@/components/WaitlistDialog";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/services" component={Services} />
      <Route path="/how-it-works" component={HowItWorks} />
      <Route path="/quote" component={Quote} />
      <Route path="/about" component={About} />
      <Route path="/waitlist" component={Waitlist} />
      <Route path="/admin/waitlist" component={AdminWaitlist} />
      <Route path="/theme" component={ThemeCustomization} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [showWaitlistPopup, setShowWaitlistPopup] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-grow">
          <Router />
        </main>
        <Footer />
        <WaitlistDialog 
          open={showWaitlistPopup}
          onOpenChange={(open) => {
            setShowWaitlistPopup(open);
          }}
        />
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;