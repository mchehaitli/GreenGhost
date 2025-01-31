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

const Navigation = () => {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/services", label: "Services" },
    { href: "/quote", label: "Get Quote" },
    { href: "/about", label: "About" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-8">
        <Link href="/">
          <a className="flex items-center space-x-2 group transition-transform duration-300 hover:scale-105">
            <GhostMascot size="sm" animated={false} />
            <span className="text-xl font-bold text-primary transition-colors duration-300 group-hover:opacity-90">GreenGhost</span>
            <span className="text-xl font-bold text-foreground transition-colors duration-300 group-hover:opacity-90">Tech</span>
          </a>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <a
                className={cn(
                  "text-sm font-medium transition-all duration-300",
                  "relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full",
                  location === item.href
                    ? "text-primary after:w-full"
                    : "text-muted-foreground hover:text-primary"
                )}
              >
                {item.label}
              </a>
            </Link>
          ))}
          <Button asChild>
            <Link href="/quote">Get Started</Link>
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
                <Link key={item.href} href={item.href}>
                  <a
                    onClick={() => setOpen(false)}
                    className={cn(
                      "text-sm font-medium p-2 rounded-md transition-all duration-300",
                      location === item.href
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                    )}
                  >
                    {item.label}
                  </a>
                </Link>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default Navigation;