import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import ServiceCard from "@/components/ServiceCard";
import ServiceCardSkeleton from "@/components/ServiceCardSkeleton";
import { useQuery } from "@tanstack/react-query";
import {
  Bot,
  Sprout,
  Scissors,
  Activity,
  Droplets,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import WaitlistDialog from "@/components/WaitlistDialog";

type Service = {
  id: number;
  name: string;
  description: string;
  category: 'core' | 'additional';
  active: boolean;
};

const serviceIcons = {
  "Lawn Automation": <Bot className="w-6 h-6" />,
  "Smart Irrigation": <Droplets className="w-6 h-6" />,
  "Scheduled Maintenance": <Scissors className="w-6 h-6" />,
  "Lawn Analytics": <Activity className="w-6 h-6" />,
};

const Services = () => {
  const [showWaitlist, setShowWaitlist] = useState(false);
  const [showDemoDialog, setShowDemoDialog] = useState(false);

  const { data: services = [], isLoading } = useQuery<Service[]>({
    queryKey: ['services'],
    queryFn: async () => {
      const res = await fetch('/api/services');
      if (!res.ok) throw new Error('Failed to fetch services');
      return res.json();
    },
  });

  const coreServices = services.filter(service => 
    service.active && service.category === 'core'
  );

  const additionalServices = services.filter(service => 
    service.active && service.category === 'additional'
  );

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

  const handleDemoDialogChange = (open: boolean) => {
    setShowDemoDialog(open);
    if (!open) {
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
              <Button 
                variant="outline" 
                size="lg" 
                onClick={() => setShowDemoDialog(true)}
                className="group"
              >
                Schedule Demo
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          </div>

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
              [...Array(4)].map((_, index) => (
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
              ))
            ) : (
              coreServices.map((service) => (
                <motion.div 
                  key={service.id} 
                  variants={itemVariants}
                  whileHover={{ 
                    scale: 1.05,
                    transition: { type: "spring", stiffness: 300 }
                  }}
                  className="h-full"
                >
                  <ServiceCard
                    icon={serviceIcons[service.name as keyof typeof serviceIcons] || <Bot className="w-6 h-6" />}
                    title={service.name}
                    description={service.description}
                  />
                </motion.div>
              ))
            )}
          </motion.div>
        </div>
      </section>

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
            {isLoading ? (
              [...Array(6)].map((_, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  viewport={{ once: true }}
                >
                  <ServiceCardSkeleton />
                </motion.div>
              ))
            ) : (
              additionalServices.map((service, index) => (
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
                            View Pricing
                            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
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

      <WaitlistDialog 
        open={showWaitlist} 
        onOpenChange={setShowWaitlist}
      />

      <WaitlistDialog 
        open={showDemoDialog} 
        onOpenChange={handleDemoDialogChange}
        isDemo={true}
      />
    </motion.div>
  );
};

export default Services;