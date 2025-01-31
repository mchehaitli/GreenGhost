import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Menu, Palette } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const Navigation = () => {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/services", label: "Services" },
    { href: "/quote", label: "Get Quote" },
    { href: "/about", label: "About" },
    { href: "/theme", label: "Theme", icon: <Palette className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-8">
        <Link href="/">
          <a className="flex items-center space-x-2">
            <span className="text-xl font-bold text-primary">GreenGhost</span>
            <span className="text-xl font-bold text-foreground">Tech</span>
          </a>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <a
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary inline-flex items-center gap-2",
                  location === item.href
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                {item.icon}
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
            <Button variant="ghost" size="icon">
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
                      "text-sm font-medium transition-colors hover:text-primary inline-flex items-center gap-2",
                      location === item.href
                        ? "text-primary"
                        : "text-muted-foreground"
                    )}
                  >
                    {item.icon}
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