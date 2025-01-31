import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import ServiceCard from "@/components/ServiceCard";
import ServiceCardSkeleton from "@/components/ServiceCardSkeleton";
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
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card"; // Assuming these are needed


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
              <Link href="/quote">Book Now</Link>
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

          <motion.div
            className="mt-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="max-w-2xl mx-auto">
              <CardContent className="pt-6">
                <h3 className="text-2xl font-bold mb-4">À La Carte Services Available</h3>
                <p className="text-muted-foreground mb-6">
                  Choose individual automated services based on your needs. Perfect for those who want flexibility 
                  in their lawn care routine. Contact us for custom pricing based on your specific requirements.
                </p>
                <Button asChild>
                  <Link href="/quote">Get Custom Quote</Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
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
      </motion.section>
    </div>
  );
};

export default Services;