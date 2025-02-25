import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { GhostMascot } from "./GhostMascot";

const Hero = () => {
  return (
    <div className="relative flex items-center justify-center min-h-[80vh] bg-background mb-16">
      <div className="container mx-auto px-8">
        <div className="flex flex-col items-center justify-center text-center max-w-4xl mx-auto">
          <div className="pt-4">
            <GhostMascot size="lg" className="mb-8" />
          </div>
          <h1 className="text-5xl font-bold tracking-tighter sm:text-6xl md:text-7xl lg:text-8xl bg-gradient-to-r from-foreground via-foreground/90 to-foreground bg-clip-text text-transparent">
            Welcome to the Future of{" "}
            <span className="text-primary bg-gradient-to-r from-primary via-primary/80 to-primary/70 bg-clip-text">{" "}Automated</span>{" "}
            <span className="bg-gradient-to-r from-foreground via-foreground/90 to-foreground bg-clip-text">Landscaping</span>
          </h1>
          <p className="mt-6 text-xl text-muted-foreground sm:text-2xl max-w-2xl mx-auto font-medium">
            Ready for the Best Lawn on the Block?
          </p>
          <p className="mt-2 text-xl text-muted-foreground sm:text-2xl max-w-2xl mx-auto font-medium">
            Discover Our Automated Lawn Care Solutions.
          </p>
          <p className="mt-4 text-sm text-muted-foreground sm:text-base max-w-2xl mx-auto italic">
            Starting Summer 2025: Testing our innovative systems in North Dallas, with planned expansion throughout Texas and beyond.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" variant="outline" className="text-lg">
              <Link href="/services">View Services</Link>
            </Button>
            <Button asChild size="lg" className="text-lg bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
              <Link href="/waitlist">Join Waitlist</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg">
              <Link href="/about">About Us</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;