import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import ServiceCard from "@/components/ServiceCard";
import ServiceCardSkeleton from "@/components/ServiceCardSkeleton";
import {
  Bot,
  Sprout,
  Scissors,
  Activity,
  Droplets,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import WaitlistDialog from "@/components/WaitlistDialog"; // Added import

// Additional services array - copied from PricingCalculator.tsx
const additionalServices = [
  { id: "edging", name: "Edging & Trimming", description: "Precision edging and trimming for a manicured look along walkways, driveways, and garden beds." },
  { id: "fertilization", name: "Fertilization", description: "Custom-blended fertilizer application that promotes healthy growth and vibrant color throughout the seasons." },
  { id: "weedControl", name: "Weed Control", description: "Targeted treatment that eliminates weeds while protecting your lawn and garden plants." },
  { id: "leafRemoval", name: "Leaf Removal", description: "Efficient removal of fallen leaves to maintain lawn health and appearance during autumn." },
  { id: "soilTesting", name: "Soil Analysis & Treatment", description: "Comprehensive soil testing with custom amendment recommendations for optimal plant growth." },
  { id: "aerationService", name: "Lawn Aeration", description: "Core aeration to reduce soil compaction and improve water, nutrient, and oxygen flow to grass roots." },
  { id: "gardenMaintenance", name: "Garden Bed Maintenance", description: "Complete care for garden beds including weeding, pruning, and seasonal plantings." },
  { id: "mulching", name: "Mulching Service", description: "Professional mulch application to retain soil moisture, reduce weeds, and enhance landscape appearance." },
  { id: "hardscaping", name: "Hardscape Cleaning", description: "Thorough cleaning of patios, walkways, and other hardscape elements to maintain their appearance." },
  { id: "seasonalCleanup", name: "Seasonal Cleanup", description: "Comprehensive cleanup services during spring and fall to prepare your landscape for the coming season." }
];

const Services = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [showWaitlist, setShowWaitlist] = useState(false);
  const [showDemoDialog, setShowDemoDialog] = useState(false); // New state for demo dialog

  const services = [
    {
      icon: <Bot className="w-6 h-6" />,
      title: "Lawn Automation",
      description: "Precision cutting with robotic mowers for a perfect lawn every time.",
      tooltip: "Our AI-powered robotic mowers use advanced sensors and GPS technology to navigate your lawn with millimeter precision, operating 24/7 in any weather condition."
    },
    {
      icon: <Droplets className="w-6 h-6" />,
      title: "Smart Irrigation",
      description: "Water-efficient irrigation systems that adapt to weather conditions and soil moisture.",
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
      title: "Lawn Analytics",
      description: "Real-time monitoring and analysis of lawn conditions for optimal health.",
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

  // Handler for demo dialog close events
  const handleDemoDialogChange = (open: boolean) => {
    setShowDemoDialog(open);
    // If dialog is closing and not by the X button (user clicked Join Waitlist)
    if (!open) {
      // We need a slight delay to avoid dialog animations conflicting
      setTimeout(() => {
        setShowWaitlist(true);
      }, 100);
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
              Transforming Lawn Care with Technology
            </motion.h1>
            <motion.p 
              className="text-xl text-muted-foreground mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <span className="text-primary font-semibold">Revolutionary solutions</span> that deliver professional results with minimal human intervention
            </motion.p>
            <motion.div
              className="flex justify-center items-center gap-2 mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span className="text-sm">Time-saving</span>
              </div>
              <span className="text-muted-foreground">•</span>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span className="text-sm">Water-efficient</span>
              </div>
              <span className="text-muted-foreground">•</span>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span className="text-sm">Eco-friendly</span>
              </div>
            </motion.div>
            <motion.div 
              className="flex flex-wrap justify-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
                <Link href="/waitlist">Join Waitlist</Link>
              </Button>
            </motion.div>
          </div>

          {/* Added decorative elements */}
          <motion.div 
            className="absolute -top-10 -left-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            transition={{ duration: 1, delay: 0.2 }}
          />
          <motion.div 
            className="absolute -bottom-20 -right-20 w-60 h-60 bg-primary/10 rounded-full blur-3xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ duration: 1, delay: 0.3 }}
          />
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
                    className="h-full"
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

      {/* Additional Services Section */}
      <section className="py-20 bg-background border-t border-border/40">
        <div className="container">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-4">Additional Services</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Enhance your lawn care experience with our premium add-on services, 
              each designed to address specific aspects of landscape maintenance
            </p>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            {additionalServices.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <Card className="h-full border-primary/10 hover:border-primary/30 transition-colors duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-1">{service.name}</h3>
                        <p className="text-muted-foreground text-sm">{service.description}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <Button variant="ghost" size="sm" className="group" asChild>
                        <Link href="/pricing" className="flex items-center gap-1">
                          Learn More
                          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
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
            onClick={() => setShowWaitlist(true)}
            size="lg"
            variant="secondary"
            className="bg-white text-primary hover:bg-white/90"
          >
            Join Waitlist
          </Button>
        </div>
      </motion.section>

      {/* Waitlist Dialog */}
      <WaitlistDialog 
        open={showWaitlist} 
        onOpenChange={setShowWaitlist}
      />

      {/* Demo Dialog - Using the same WaitlistDialog component with a special demo mode */}
      <WaitlistDialog 
        open={showDemoDialog} 
        onOpenChange={handleDemoDialogChange}
        isDemo={true} // Added prop to indicate this is for demo scheduling
      />
    </motion.div>
  );
};

export default Services;