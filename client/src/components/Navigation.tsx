import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Menu, User } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { GhostMascot } from "./GhostMascot";
import WaitlistDialog from "./WaitlistDialog";
import { useAuth } from "@/hooks/use-auth";

const Navigation = () => {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const [showWaitlist, setShowWaitlist] = useState(false);
  const { user, logout } = useAuth();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/services", label: "Services" },
    { href: "/how-it-works", label: "How It Works" },
    { href: "/pricing", label: "Pricing" }, 
    { href: "/blog", label: "Blog" },
    { href: "/about", label: "About Us" },
  ];

  const handleWaitlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowWaitlist(true);
  };
  
  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    await logout();
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-8">
          <div onClick={scrollToTop} className="cursor-pointer">
            <Link href="/">
              <div className="flex items-center space-x-2 group">
                <GhostMascot size="sm" animated={false} />
                <span className="text-xl font-bold transition-colors duration-300 group-hover:opacity-90">
                  <span className="text-primary">Green</span>
                  <span className="text-white ml-1">Ghost</span>
                </span>
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
            
            {user ? (
              <>
                <div onClick={scrollToTop} className="cursor-pointer">
                  <Link href="/admin">
                    <div
                      className={cn(
                        "text-sm font-medium transition-all duration-300",
                        "relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full",
                        location === "/admin"
                          ? "text-primary after:w-full"
                          : "text-muted-foreground hover:text-primary"
                      )}
                    >
                      Admin Portal
                    </div>
                  </Link>
                </div>
                <Button 
                  variant="outline" 
                  onClick={handleLogout}
                  className="bg-primary/10 text-primary hover:bg-primary/20"
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  onClick={handleWaitlistClick}
                  className="bg-primary/10 text-primary hover:bg-primary/20"
                >
                  Join Waitlist
                </Button>
                <div onClick={scrollToTop} className="cursor-pointer">
                  <Link href="/login">
                    <div
                      className={cn(
                        "text-sm font-medium transition-all duration-300",
                        "flex items-center gap-1",
                        "relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full",
                        location === "/login"
                          ? "text-primary after:w-full"
                          : "text-muted-foreground hover:text-primary"
                      )}
                    >
                      <User size={16} />
                      Login
                    </div>
                  </Link>
                </div>
              </>
            )}
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

                {user ? (
                  <>
                    <div onClick={() => {
                      setOpen(false);
                      scrollToTop();
                    }}>
                      <Link href="/admin">
                        <div
                          className={cn(
                            "text-sm font-medium p-2 rounded-md transition-all duration-300 cursor-pointer",
                            location === "/admin"
                              ? "text-primary bg-primary/10"
                              : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                          )}
                        >
                          Admin Portal
                        </div>
                      </Link>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={(e) => {
                        e.preventDefault();
                        setOpen(false);
                        handleLogout(e);
                      }}
                      className="bg-primary/10 text-primary hover:bg-primary/20"
                    >
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
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
                    <div onClick={() => {
                      setOpen(false);
                      scrollToTop();
                    }}>
                      <Link href="/login">
                        <div
                          className={cn(
                            "text-sm font-medium p-2 rounded-md transition-all duration-300 cursor-pointer flex items-center gap-1",
                            location === "/login"
                              ? "text-primary bg-primary/10"
                              : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                          )}
                        >
                          <User size={16} />
                          Login
                        </div>
                      </Link>
                    </div>
                  </>
                )}
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