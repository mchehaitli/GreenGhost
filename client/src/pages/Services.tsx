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
  Clipper,
  Check,
  Settings,
  Ruler,
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import WaitlistDialog from "@/components/WaitlistDialog";
import { subscriptionPlans } from "@/lib/subscription-plans";

const Services = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [showWaitlist, setShowWaitlist] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const serviceSteps = [
    {
      icon: <Ruler className="w-6 h-6" />,
      title: "Initial Assessment",
      description: "Our expert arrives and carefully assesses your lawn's specific needs and characteristics."
    },
    {
      icon: <Settings className="w-6 h-6" />,
      title: "Mower Setup",
      description: "We set up the robotic mower with precise geofencing to ensure complete coverage of your lawn."
    },
    {
      icon: <Bot className="w-6 h-6" />,
      title: "Automated Mowing",
      description: "Our advanced robotic mower maintains your lawn at the perfect height, adapting to growth patterns."
    },
    {
      icon: <Scissors className="w-6 h-6" />,
      title: "Expert Finishing",
      description: "Professional trimming, edging, and bush cutting for that perfectly manicured look."
    },
    {
      icon: <Check className="w-6 h-6" />,
      title: "Quality Check",
      description: "Final inspection ensures everything meets our high standards before departure."
    }
  ];

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
          <div className="max-w-3xl mx-auto text-center">
            <motion.h1 
              className="text-4xl font-bold mb-6"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Our Service Process
            </motion.h1>
            <motion.p 
              className="text-lg text-muted-foreground mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              Experience the perfect blend of automated efficiency and human expertise
            </motion.p>
          </div>
        </div>
      </motion.section>

      {/* Service Process Steps */}
      <section className="py-20 bg-background/50">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              {serviceSteps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex items-start gap-6 p-6 bg-card rounded-lg border"
                >
                  <div className="bg-primary/10 p-3 rounded-lg">
                    {step.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Subscription Plans */}
      <section className="py-20 bg-background relative">
        <div className="container">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-4">Choose Your Service Frequency</h2>
            <p className="text-lg text-muted-foreground">
              Select a plan that fits your lawn care needs and schedule
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {subscriptionPlans.slice(0, 3).map((plan, index) => (
              <Card key={plan.id} className="relative overflow-hidden">
                <CardContent className="p-6">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-3xl font-bold text-primary mb-4">
                    ${plan.price}<span className="text-sm text-muted-foreground">/month</span>
                  </p>
                  <p className="text-muted-foreground mb-6">{plan.description}</p>
                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-primary" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full" onClick={() => setShowWaitlist(true)}>
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Pricing Calculator */}
      <section className="py-20 bg-background/50">
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
              Get an instant estimate based on your lawn size and service frequency
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
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Lawn Care Experience?</h2>
          <p className="mb-8">Join our waitlist today and be among the first to experience the future of lawn care.</p>
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
    </motion.div>
  );
};

export default Services;