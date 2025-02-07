import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { GhostMascot } from "./GhostMascot";

const Hero = () => {
  return (
    <div className="relative flex items-center justify-center min-h-[80vh] bg-background">
      <div className="container mx-auto px-8">
        <div className="flex flex-col items-center justify-center text-center max-w-4xl mx-auto">
          <GhostMascot size="lg" className="mb-8" />
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
            Welcome to the Future of{" "}
            <span className="text-primary">Automated</span>{" "}
            Landscaping
          </h1>
          <p className="mt-6 text-lg text-muted-foreground sm:text-xl max-w-2xl mx-auto">
            Ready for the Best Lawn on the Block? Discover Our Automated Lawn Care Solutions.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" variant="outline">
              <Link href="/services">View Services</Link>
            </Button>
            <Button asChild size="lg">
              <Link href="/waitlist">Join Waitlist</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/about">About Us</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;