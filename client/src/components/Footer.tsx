import { Link } from "wouter";

const Footer = () => {
  return (
    <footer className="border-t">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link href="/">
              <a className="flex items-center space-x-2">
                <span className="text-xl font-bold text-primary">GreenGhost</span>
                <span className="text-xl font-bold">Tech</span>
              </a>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              Automated landscaping solutions for modern properties.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Services</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/services">
                  <a className="text-sm text-muted-foreground hover:text-primary">
                    Lawn Maintenance
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/services">
                  <a className="text-sm text-muted-foreground hover:text-primary">
                    Landscape Design
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/services">
                  <a className="text-sm text-muted-foreground hover:text-primary">
                    Automation Systems
                  </a>
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about">
                  <a className="text-sm text-muted-foreground hover:text-primary">
                    About Us
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/quote">
                  <a className="text-sm text-muted-foreground hover:text-primary">
                    Get Quote
                  </a>
                </Link>
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
                (555) 123-4567
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} GreenGhost Tech. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
