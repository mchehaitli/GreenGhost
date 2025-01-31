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
  const services = [
    {
      icon: <Bot className="w-6 h-6" />,
      title: "Automated Lawn Mowing",
      description: "Precision cutting with robotic mowers for a perfect lawn every time.",
      tooltip: "Our AI-powered robotic mowers use advanced sensors and GPS technology to navigate your lawn with millimeter precision, operating 24/7 in any weather condition."
    },
    {
      icon: <Droplets className="w-6 h-6" />,
      title: "Smart Irrigation",
      description: "Water-efficient systems that adapt to weather conditions.",
      tooltip: "Smart irrigation controllers analyze real-time weather data, soil moisture levels, and plant needs to optimize watering schedules, reducing water usage by up to 50%."
    },
    {
      icon: <Scissors className="w-6 h-6" />,
      title: "Scheduled Maintenance",
      description: "Regular automated maintenance to keep your lawn looking its best.",
      tooltip: "Automated scheduling system deploys maintenance robots at optimal times, considering growth patterns, weather forecasts, and your preferences."
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="bg-background py-20">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-6">Our Services</h1>
            <p className="text-lg text-muted-foreground mb-8">
              Experience premium automated landscaping services
            </p>
            <Button asChild size="lg">
              <Link href="/quote">Book Now</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 bg-muted/10">
        <div className="container">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <ServiceCard
                key={index}
                icon={service.icon}
                title={service.title}
                description={service.description}
                tooltip={service.tooltip}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary text-primary-foreground py-20">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Landscape?</h2>
          <p className="mb-8">Contact us today to learn more about our automated solutions.</p>
          <Button
            asChild
            size="lg"
            variant="secondary"
            className="bg-white text-primary hover:bg-white/90"
          >
            <Link href="/quote">Get Started</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Services;