import { Button } from "@/components/ui/button";
import { Link } from "wouter";

const Hero = () => {
  return (
    <div className="relative">
      <div className="container flex flex-col items-center text-center py-20 lg:py-32">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
          The Future of{" "}
          <span className="text-primary">Automated Landscaping</span>
        </h1>
        <p className="mt-6 max-w-[42rem] text-lg text-muted-foreground sm:text-xl">
          Precision landscaping powered by cutting-edge automation. We deliver
          beautiful, sustainable, and hassle-free outdoor spaces for your home or
          business.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Button asChild size="lg">
            <Link href="/quote">Get Free Quote</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/services">Our Services</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Hero;
