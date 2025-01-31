import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import ServiceCard from "@/components/ServiceCard";
import {
  Bot,
  Sprout,
  Scissors,
  TreePine,
  Activity,
  Droplets,
  Sun,
  Workflow,
} from "lucide-react";

const Services = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <section className="bg-slate-50 py-20 flex items-center justify-center">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-6">Our Services</h1>
            <p className="text-lg text-muted-foreground mb-8">
              Discover our comprehensive range of automated landscaping services
              designed to keep your property beautiful year-round.
            </p>
            <Button asChild size="lg">
              <Link href="/quote">Get Free Quote</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 flex-grow">
        <div className="container max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
            <ServiceCard
              icon={<Bot className="w-6 h-6" />}
              title="Automated Mowing"
              description="Precision robotic mowing systems that maintain your lawn at the perfect height."
            />
            <ServiceCard
              icon={<Droplets className="w-6 h-6" />}
              title="Smart Irrigation"
              description="Weather-adaptive irrigation systems that optimize water usage."
            />
            <ServiceCard
              icon={<Scissors className="w-6 h-6" />}
              title="Trimming & Edging"
              description="Automated edge maintenance and precision trimming for a polished look."
            />
            <ServiceCard
              icon={<TreePine className="w-6 h-6" />}
              title="Tree Care"
              description="Monitored tree health and automated pruning schedules."
            />
            <ServiceCard
              icon={<Activity className="w-6 h-6" />}
              title="Lawn Health Monitoring"
              description="Real-time monitoring of soil conditions and lawn health metrics."
            />
            <ServiceCard
              icon={<Sun className="w-6 h-6" />}
              title="Climate Control"
              description="Smart systems that adjust care based on weather conditions."
            />
            <ServiceCard
              icon={<Sprout className="w-6 h-6" />}
              title="Garden Maintenance"
              description="Automated care for flower beds and vegetable gardens."
            />
            <ServiceCard
              icon={<Workflow className="w-6 h-6" />}
              title="System Integration"
              description="Seamless integration of all automated landscaping systems."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-primary-foreground py-20">
        <div className="container max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Automate Your Landscape?
          </h2>
          <p className="mb-8 mx-auto">
            Contact us today to learn how our automated solutions can transform
            your property maintenance.
          </p>
          <Button
            asChild
            size="lg"
            variant="secondary"
            className="bg-white text-primary hover:bg-white/90"
          >
            <Link href="/quote">Request a Quote</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Services;