import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { GhostMascot } from "./GhostMascot";

const Hero = () => {
  return (
    <div className="relative flex items-center justify-center min-h-[80vh] bg-background mb-16">
      <div className="container mx-auto px-8">
        <div className="flex flex-col items-center justify-center text-center max-w-4xl mx-auto">
          <GhostMascot size="lg" className="mb-8" />
          <h1 className="text-5xl font-bold tracking-tighter sm:text-6xl md:text-7xl lg:text-8xl bg-gradient-to-r from-foreground via-foreground/90 to-foreground bg-clip-text text-transparent">
            Automated Lawn Care with a{" "}
            <span className="text-primary bg-gradient-to-r from-primary via-primary/80 to-primary/70 bg-clip-text">Personal Touch</span>
          </h1>
          <p className="mt-6 text-xl text-muted-foreground sm:text-2xl max-w-2xl mx-auto font-medium">
            We combine robotic mowing with expert trimming and bush cutting for a perfectly manicured lawn
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 w-full max-w-3xl">
            <div className="flex items-center justify-center p-4 bg-primary/5 rounded-lg">
              <p className="text-lg font-medium">Free up your weekends</p>
            </div>
            <div className="flex items-center justify-center p-4 bg-primary/5 rounded-lg">
              <p className="text-lg font-medium">Hassle-free lawn care</p>
            </div>
            <div className="flex items-center justify-center p-4 bg-primary/5 rounded-lg">
              <p className="text-lg font-medium">Consistently perfect lawn</p>
            </div>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="text-lg bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
              <Link href="/waitlist">Join Waitlist</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-lg">
              <Link href="/services">View Pricing</Link>
            </Button>
          </div>
          <p className="mt-6 text-sm text-muted-foreground italic">
            Launching Summer 2025 in North Dallas • Pre-launch special pricing available
          </p>
        </div>
      </div>
    </div>
  );
};

export default Hero;