import { Link } from "wouter";
import { useState } from "react";
import WaitlistDialog from "./WaitlistDialog";
import { Instagram, Facebook } from "lucide-react";
import { SiX } from "react-icons/si";

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
                  <span className="text-xl font-bold transition-transform duration-300 group-hover:scale-105">
                    <span className="text-primary">Green</span>
                    <span className="text-white ml-1">Ghost</span>
                  </span>
                </div>
              </Link>

              {/* Social Media Icons - Aligned with the G in GreenGhost */}
              <div className="flex space-x-5 mt-5 ml-1.5">
                <a 
                  href="https://www.instagram.com/greenghost.io" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors duration-300" 
                  aria-label="Follow us on Instagram"
                >
                  <Instagram size={20} />
                </a>
                <a 
                  href="https://x.com/greenghost_io" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors duration-300" 
                  aria-label="Follow us on X"
                >
                  <SiX size={20} />
                </a>
                <a 
                  href="https://www.facebook.com/greenghostio" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors duration-300" 
                  aria-label="Follow us on Facebook"
                >
                  <Facebook size={20} />
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
                  contact@greenghost.io
                </li>
                <li className="text-sm text-muted-foreground">
                  Beta Launch: Fall 2025
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