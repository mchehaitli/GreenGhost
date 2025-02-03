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
    },
    {
      icon: <Activity className="w-6 h-6" />,
      title: "Lawn Health Analytics",
      description: "Real-time monitoring and analysis of lawn conditions.",
      tooltip: "Advanced analytics provide insights into your lawn's health, growth patterns, and maintenance needs."
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
    <motion.div 
      className="min-h-screen relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.section 
        className="bg-background py-20 relative overflow-hidden"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container relative z-10">
          <div className="max-w-2xl mx-auto text-center">
            <motion.h1 
              className="text-4xl font-bold mb-6"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Our Services
            </motion.h1>
            <motion.p 
              className="text-lg text-muted-foreground mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              Experience premium automated landscaping services
            </motion.p>
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
              <Link href="/waitlist">Join Waitlist</Link>
            </Button>
          </div>
        </div>
      </motion.section>

      <section className="py-20 bg-background/50">
        <div className="container">
          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {isLoading ? (
              <>
                {[...Array(4)].map((_, index) => (
                  <motion.div 
                    key={index} 
                    variants={itemVariants}
                    whileHover={{ 
                      scale: 1.05,
                      transition: { type: "spring", stiffness: 300 }
                    }}
                  >
                    <ServiceCardSkeleton />
                  </motion.div>
                ))}
              </>
            ) : (
              <>
                {services.map((service, index) => (
                  <motion.div 
                    key={index} 
                    variants={itemVariants}
                    whileHover={{ 
                      scale: 1.05,
                      transition: { type: "spring", stiffness: 300 }
                    }}
                  >
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

      <section className="py-20 bg-background relative">
        <div className="container">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-4">Calculate Your Service Cost</h2>
            <p className="text-lg text-muted-foreground">
              Get an instant estimate for our automated lawn care services
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <PricingCalculator />
          </motion.div>
        </div>
      </section>

      <motion.section 
        className="bg-primary text-primary-foreground py-20 relative"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
      >
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Landscape?</h2>
          <p className="mb-8">Join our waitlist today to experience the future of lawn care.</p>
          <Button
            asChild
            size="lg"
            variant="secondary"
            className="bg-white text-primary hover:bg-white/90"
          >
            <Link href="/waitlist">Join Waitlist</Link>
          </Button>
        </div>
      </motion.section>
    </motion.div>
  );
};

export default Services;