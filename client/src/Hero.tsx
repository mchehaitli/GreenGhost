import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { GhostMascot } from "./GhostMascot";

const Hero = () => {
  return (
    <div className="relative flex items-center justify-center min-h-[80vh] bg-background">
      <div className="container mx-auto px-8">
        <div className="flex flex-col items-center justify-center text-center max-w-4xl mx-auto">
          <GhostMascot size="lg" className="mb-8" />
          <h1 className="text-5xl font-bold tracking-tighter sm:text-6xl md:text-7xl lg:text-8xl bg-gradient-to-r from-foreground via-foreground/90 to-foreground bg-clip-text text-transparent">
            Your Perfect Lawn,{" "}
            <span className="text-[#34D399] bg-gradient-to-r from-[#34D399] via-[#059669] to-[#34D399]/80 bg-clip-text">Without</span>{" "}
            <span className="bg-gradient-to-r from-foreground via-foreground/90 to-foreground bg-clip-text">The Work</span>
          </h1>
          <p className="mt-6 text-xl text-muted-foreground sm:text-2xl max-w-2xl mx-auto font-medium">
            Enjoy a Beautiful, Professionally Maintained Lawn
          </p>
          <p className="mt-2 text-xl text-muted-foreground sm:text-2xl max-w-2xl mx-auto font-medium">
            While You Focus on What Matters Most
          </p>
          <p className="mt-4 text-sm text-muted-foreground sm:text-base max-w-2xl mx-auto">
            Join our exclusive waitlist today and be among the first to experience hassle-free lawn care in North Dallas
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="text-lg bg-gradient-to-r from-[#34D399] to-[#059669] hover:from-[#34D399]/90 hover:to-[#059669]/90">
              <Link href="/waitlist">Join Waitlist Now</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-lg">
              <Link href="/services">View Plans & Pricing</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;