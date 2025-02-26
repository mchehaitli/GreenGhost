import { Link } from "wouter";
import { useState } from "react";
import WaitlistDialog from "./WaitlistDialog";
import { Instagram, Twitter, Facebook, Linkedin } from "lucide-react";

const Footer = () => {
  const [showWaitlist, setShowWaitlist] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleWaitlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowWaitlist(true);
  };

  return (
    <>
      <footer className="border-t">
        <div className="container py-8 md:py-12 px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            <div className="col-span-2 md:col-span-1">
              <Link href="/">
                <div className="flex items-center space-x-2 group cursor-pointer" onClick={scrollToTop}>
                  <span className="text-xl font-bold text-primary transition-transform duration-300 group-hover:scale-105">GreenGhost</span>
                  <span className="text-xl font-bold text-foreground transition-transform duration-300 group-hover:scale-105">Tech</span>
                </div>
              </Link>

              {/* Social Media Icons - Moved to be more centered and slightly to the right */}
              <div className="flex justify-center md:justify-start space-x-5 mt-5 pl-4">
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors duration-300" aria-label="Instagram">
                  <Instagram size={20} />
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors duration-300" aria-label="Twitter">
                  <Twitter size={20} />
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors duration-300" aria-label="Facebook">
                  <Facebook size={20} />
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors duration-300" aria-label="LinkedIn">
                  <Linkedin size={20} />
                </a>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/about">
                    <div onClick={scrollToTop} className="text-sm text-muted-foreground transition-all duration-300 hover:text-primary hover:translate-x-1 inline-block cursor-pointer">
                      About Us
                    </div>
                  </Link>
                </li>
                <li>
                  <div 
                    onClick={handleWaitlistClick}
                    className="text-sm text-muted-foreground transition-all duration-300 hover:text-primary hover:translate-x-1 inline-block cursor-pointer"
                  >
                    Join Waitlist
                  </div>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Contact</h3>
              <ul className="space-y-2">
                <li className="text-sm text-muted-foreground">
                  contact@greenghosttech.com
                </li>
                <li className="text-sm text-muted-foreground">
                  Beta Launch: Summer 2025
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} GreenGhost Tech. All rights reserved.
          </div>
        </div>
      </footer>

      <WaitlistDialog 
        open={showWaitlist} 
        onOpenChange={setShowWaitlist}
      />
    </>
  );
};

export default Footer;