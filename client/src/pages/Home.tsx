import Hero from "@/components/Hero";
import ServiceCard from "@/components/ServiceCard";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  Bot,
  Sprout,
  Scissors,
  TreePine,
  Activity,
  Clock,
} from "lucide-react";

const Home = () => {
  return (
    <div>
      <Hero />

      {/* Features Section */}
      <section className="py-20 bg-slate-50">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Choose GreenGhost Tech?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <ServiceCard
              icon={<Bot className="w-6 h-6" />}
              title="Automated Precision"
              description="Advanced robotics and AI systems for precise lawn care and maintenance."
            />
            <ServiceCard
              icon={<Activity className="w-6 h-6" />}
              title="Smart Monitoring"
              description="Real-time monitoring of your landscape's health and maintenance needs."
            />
            <ServiceCard
              icon={<Clock className="w-6 h-6" />}
              title="24/7 Service"
              description="Automated systems work around the clock to maintain your property."
            />
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="py-20">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Services</h2>
            <p className="text-muted-foreground">
              Comprehensive landscaping solutions powered by cutting-edge technology
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ServiceCard
              icon={<Scissors className="w-6 h-6" />}
              title="Lawn Maintenance"
              description="Automated mowing, edging, and trimming services for a perfectly maintained lawn."
            />
            <ServiceCard
              icon={<Sprout className="w-6 h-6" />}
              title="Garden Care"
              description="Smart irrigation and plant health monitoring systems for thriving gardens."
            />
            <ServiceCard
              icon={<TreePine className="w-6 h-6" />}
              title="Landscape Design"
              description="Custom landscape design with sustainable and low-maintenance solutions."
            />
          </div>
          <div className="text-center mt-12">
            <Button asChild size="lg">
              <Link href="/services">View All Services</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Transform Your Landscape?
          </h2>
          <p className="mb-8 max-w-2xl mx-auto">
            Get started with our automated landscaping solutions today and
            experience the future of property maintenance.
          </p>
          <Button
            asChild
            size="lg"
            variant="secondary"
            className="bg-white text-primary hover:bg-white/90"
          >
            <Link href="/quote">Get Your Free Quote</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Home;