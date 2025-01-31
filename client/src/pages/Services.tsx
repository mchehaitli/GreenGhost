import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import ServiceCard from "@/components/ServiceCard";
import ServiceCardSkeleton from "@/components/ServiceCardSkeleton";
import PricingCalculator from "@/components/PricingCalculator";
import {
  Bot,
  Sprout,
  Scissors,
  Activity,
  Droplets,
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

const Services = () => {
  const [isLoading, setIsLoading] = useState(true);
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

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  return (
    <div className="min-h-screen">
      <motion.section 
        className="bg-background py-20"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-6">Our Services</h1>
            <p className="text-lg text-muted-foreground mb-8">
              Experience premium automated landscaping services
            </p>
            <Button asChild size="lg">
              <Link href="/services">Learn More</Link>
            </Button>
          </div>
        </div>
      </motion.section>

      <section className="py-20 bg-muted/10">
        <div className="container">
          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {isLoading ? (
              <>
                {[...Array(3)].map((_, index) => (
                  <motion.div key={index} variants={itemVariants}>
                    <ServiceCardSkeleton />
                  </motion.div>
                ))}
              </>
            ) : (
              <>
                {services.map((service, index) => (
                  <motion.div key={index} variants={itemVariants}>
                    <ServiceCard
                      icon={service.icon}
                      title={service.title}
                      description={service.description}
                      tooltip={service.tooltip}
                    />
                  </motion.div>
                ))}
              </>
            )}
          </motion.div>
        </div>
      </section>

      {/* Pricing Calculator Section */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Calculate Your Service Cost</h2>
            <p className="text-lg text-muted-foreground">
              Get an instant estimate for our automated lawn care services
            </p>
          </div>
          <PricingCalculator />
        </div>
      </section>

      <motion.section 
        className="bg-primary text-primary-foreground py-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Landscape?</h2>
          <p className="mb-8">Sign up today to learn more about our automated solutions.</p>
          <Button
            asChild
            size="lg"
            variant="secondary"
            className="bg-white text-primary hover:bg-white/90"
          >
            <Link href="/services">Get Started</Link>
          </Button>
        </div>
      </motion.section>
    </div>
  );
};

export default Services;