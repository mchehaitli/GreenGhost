import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Menu, Settings, LogOut } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import WaitlistDialog from "./WaitlistDialog";
import { useAuth } from "@/hooks/use-auth";
import { GhostMascot } from "./GhostMascot";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

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
    { href: "/pricing", label: "Pricing" }, 
    { href: "/blog", label: "Blog" },
    { href: "/about", label: "About Us" },
  ];

  const handleWaitlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowWaitlist(true);
  };
  
  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-8">
          <div onClick={scrollToTop} className="cursor-pointer">
            <Link href="/">
              <div className="flex items-center space-x-2 group">
                <span className="text-xl font-bold text-primary transition-colors duration-300 group-hover:opacity-90">GreenGhost</span>
                <span className="text-xl font-bold text-foreground transition-colors duration-300 group-hover:opacity-90">Tech</span>
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative rounded-full h-8 w-8 flex items-center justify-center">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-medium">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.username}</p>
                      {user.is_admin && (
                        <p className="text-xs leading-none text-muted-foreground">Administrator</p>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {user.is_admin && (
                    <Link href="/admin">
                      <DropdownMenuItem className="cursor-pointer">
                        <span className="mr-2">👑</span>
                        <span>Admin Portal</span>
                      </DropdownMenuItem>
                    </Link>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                variant="outline" 
                onClick={handleWaitlistClick}
                className="bg-primary/10 text-primary hover:bg-primary/20"
              >
                Join Waitlist
              </Button>
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
                {user && (
                  <div className="flex items-center p-2 mb-2 border-b pb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-medium mr-3">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium">{user.username}</div>
                      {user.is_admin && (
                        <div className="text-xs text-muted-foreground">Administrator</div>
                      )}
                    </div>
                  </div>
                )}
                
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
                    {user.is_admin && (
                      <div onClick={() => {
                        setOpen(false);
                        scrollToTop();
                      }}>
                        <Link href="/admin">
                          <div className="flex items-center text-sm font-medium p-2 rounded-md transition-all duration-300 cursor-pointer text-muted-foreground hover:text-primary hover:bg-primary/5">
                            <span className="mr-2">👑</span>
                            Admin Portal
                          </div>
                        </Link>
                      </div>
                    )}
                    
                    <div onClick={() => {
                      setOpen(false);
                      scrollToTop();
                    }}>
                      <Link href="/settings">
                        <div className="flex items-center text-sm font-medium p-2 rounded-md transition-all duration-300 cursor-pointer text-muted-foreground hover:text-primary hover:bg-primary/5">
                          <Settings className="mr-2 h-4 w-4" />
                          Settings
                        </div>
                      </Link>
                    </div>
                    
                    <div 
                      onClick={() => {
                        setOpen(false);
                        handleLogout();
                      }}
                      className="flex items-center text-sm font-medium p-2 rounded-md transition-all duration-300 cursor-pointer text-destructive hover:bg-destructive/10"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </div>
                  </>
                ) : (
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
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Waitlist Dialog */}
      {/* Ghost Mascot floating element */}
      <div className="fixed bottom-6 right-6 z-50">
        <GhostMascot size="md" animated={true} className="cursor-pointer hover:opacity-90 transition-opacity duration-300" />
      </div>

      <WaitlistDialog 
        open={showWaitlist} 
        onOpenChange={setShowWaitlist}
      />
    </>
  );
};

export default Navigation;