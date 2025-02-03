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
  Leaf,
  Flower2,
  PenTool,
  ClipboardCheck,
  FileSearch,
  Settings,
  ThumbsUp,
  HeartHandshake,
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
      icon: <PenTool className="w-6 h-6" />,
      title: "Landscape Design",
      description: "Custom landscape design with 3D visualization and AR planning.",
      tooltip: "Professional landscape architects use cutting-edge AR technology to create and visualize your dream outdoor space before implementation."
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
      icon: <Leaf className="w-6 h-6" />,
      title: "Automated Leaf Collection",
      description: "Smart systems that detect and remove fallen leaves.",
      tooltip: "Advanced sensors identify and collect fallen leaves, maintaining a clean and healthy lawn year-round."
    },
    {
      icon: <Flower2 className="w-6 h-6" />,
      title: "Garden Care Automation",
      description: "Smart solutions for flower beds and gardens.",
      tooltip: "Automated care systems for your garden, including precise watering, fertilization, and maintenance schedules."
    },
    {
      icon: <Activity className="w-6 h-6" />,
      title: "Lawn Health Analytics",
      description: "Real-time monitoring and analysis of lawn conditions.",
      tooltip: "Advanced analytics provide insights into your lawn's health, growth patterns, and maintenance needs."
    }
  ];

  const steps = [
    {
      icon: <ClipboardCheck className="w-8 h-8" />,
      title: "Get a Free Quote",
      description: "Tell us about your lawn by filling out our quick online form for a personalized estimate."
    },
    {
      icon: <FileSearch className="w-8 h-8" />,
      title: "Lawn Assessment & Custom Plan",
      description: "We'll schedule a visit to map your lawn, understand your needs, and create a custom maintenance plan tailored just for you."
    },
    {
      icon: <Settings className="w-8 h-8" />,
      title: "Automated System Setup",
      description: "Our team will install and configure your smart lawn care system, setting up the perfect schedule for a healthy, beautiful lawn."
    },
    {
      icon: <ThumbsUp className="w-8 h-8" />,
      title: "Effortless Lawn Care",
      description: "Relax and enjoy! Your automated system will take care of your lawn, providing precise care and attention, all managed remotely."
    },
    {
      icon: <HeartHandshake className="w-8 h-8" />,
      title: "Ongoing Support & Monitoring",
      description: "We'll continuously monitor your lawn's health and provide support whenever you need it, ensuring your lawn stays in top condition."
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
              <Link href="/waitlist">Join Waitlist</Link>
            </Button>
          </div>
        </div>
      </motion.section>

      {/* Get Started Steps */}
      <section className="py-20 bg-primary/5">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Get Your Dream Lawn in 5 Easy Steps</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our streamlined process makes it simple to transform your lawn care experience
            </p>
          </div>
          <motion.div 
            className="grid md:grid-cols-5 gap-8 max-w-6xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {steps.map((step, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="relative"
              >
                <Card className="h-full">
                  <CardContent className="pt-6">
                    <div className="rounded-full p-3 bg-primary/10 w-fit mb-4 mx-auto">
                      {step.icon}
                    </div>
                    <h3 className="font-semibold mb-2 text-center">{step.title}</h3>
                    <p className="text-sm text-muted-foreground text-center">{step.description}</p>
                    {index < steps.length - 1 && (
                      <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-primary/20" />
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-muted/10">
        <div className="container">
          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {isLoading ? (
              <>
                {[...Array(8)].map((_, index) => (
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
    </div>
  );
};

export default Services;