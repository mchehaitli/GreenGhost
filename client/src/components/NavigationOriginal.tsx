import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { GhostMascot } from "./GhostMascot";
import WaitlistDialog from "./WaitlistDialog";

const Navigation = () => {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const [showWaitlist, setShowWaitlist] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/services", label: "Services" },
    { href: "/pricing", label: "Pricing" }, 
    { href: "/blog", label: "Blog" },
    { href: "/about", label: "About Us" },
  ];

  const handleWaitlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowWaitlist(true);
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-8">
          <div onClick={scrollToTop} className="cursor-pointer">
            <Link href="/">
              <div className="flex items-center space-x-2 group">
                <GhostMascot size="sm" animated={false} />
                <div className="flex flex-col leading-tight transition-colors duration-300 group-hover:opacity-90">
                  <span className="text-xl font-bold text-primary">Green</span>
                  <span className="text-xl font-bold text-white">Ghost</span>
                </div>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <div key={item.href} onClick={scrollToTop} className="cursor-pointer">
                <Link href={item.href}>
                  <div
                    className={cn(
                      "text-sm font-medium transition-all duration-300",
                      "relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full",
                      location === item.href
                        ? "text-primary after:w-full"
                        : "text-muted-foreground hover:text-primary"
                    )}
                  >
                    {item.label}
                  </div>
                </Link>
              </div>
            ))}
            <Button 
              variant="outline" 
              onClick={handleWaitlistClick}
              className="bg-primary/10 text-primary hover:bg-primary/20"
            >
              Join Waitlist
            </Button>
          </nav>

          {/* Mobile Navigation */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="transition-colors duration-300 hover:bg-primary/10">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <div className="flex flex-col space-y-4 mt-4">
                {navItems.map((item) => (
                  <div key={item.href} onClick={() => {
                    setOpen(false);
                    scrollToTop();
                  }}>
                    <Link href={item.href}>
                      <div
                        className={cn(
                          "text-sm font-medium p-2 rounded-md transition-all duration-300 cursor-pointer",
                          location === item.href
                            ? "text-primary bg-primary/10"
                            : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                        )}
                      >
                        {item.label}
                      </div>
                    </Link>
                  </div>
                ))}
                <Button 
                  variant="outline" 
                  onClick={(e) => {
                    e.preventDefault();
                    setOpen(false);
                    setShowWaitlist(true);
                  }}
                  className="bg-primary/10 text-primary hover:bg-primary/20"
                >
                  Join Waitlist
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Waitlist Dialog */}
      <WaitlistDialog 
        open={showWaitlist} 
        onOpenChange={setShowWaitlist}
      />
    </>
  );
};

export default Navigation;