import Hero from "@/components/Hero";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import {
  LeafIcon,
  Clock,
  Sun,
  Sprout,
  CheckCircle2,
  DollarSign,
  Leaf,
  Bot,
  Activity,
  Waves,
} from "lucide-react";
import { motion } from "framer-motion";
import { subscriptionPlans } from "@/lib/subscription-plans";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";

export const Home = () => {
  const allPlans = subscriptionPlans.sort((a, b) => (a.price || 0) - (b.price || 0));

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div>
      <Hero />

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-b from-background to-primary/5 border-t border-border/40">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-4xl font-bold mb-6 text-center">
              Why Choose Our Service?
            </h2>
            <div className="space-y-6">
              <div className="flex items-start gap-3">
                <Clock className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold">Time Savings</h3>
                  <p className="text-muted-foreground">
                    Free up your weekends and spend more time with family. Our automated service works 24/7 to maintain your lawn.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Sun className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold">Hassle-Free Convenience</h3>
                  <p className="text-muted-foreground">
                    No more scheduling headaches or unreliable service. Our smart system handles everything automatically.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold">Professional Results</h3>
                  <p className="text-muted-foreground">
                    Get a consistently perfect lawn that makes your neighbors envious. Expert trimming ensures every detail is perfect.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <DollarSign className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold">Competitive Pricing</h3>
                  <p className="text-muted-foreground">
                    Premium service at an affordable price. Save money compared to traditional lawn care services.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Leaf className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold">Eco-Friendly Operation</h3>
                  <p className="text-muted-foreground">
                    Reduce your carbon footprint with our all-electric equipment. Quieter operation and zero emissions.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background/50 border-t border-border/40">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Choose GreenGhost Tech?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="h-full transition-all duration-300 hover:shadow-lg">
                <CardContent className="pt-6">
                  <div className="rounded-lg p-3 bg-primary/10 w-fit mb-4">
                    <Bot className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Automated Precision</h3>
                  <p className="text-muted-foreground">Advanced robotics and AI systems for precise lawn care and maintenance.</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="h-full transition-all duration-300 hover:shadow-lg">
                <CardContent className="pt-6">
                  <div className="rounded-lg p-3 bg-primary/10 w-fit mb-4">
                    <Activity className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Smart Monitoring</h3>
                  <p className="text-muted-foreground">Real-time monitoring of your landscape's health and maintenance needs.</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="h-full transition-all duration-300 hover:shadow-lg">
                <CardContent className="pt-6">
                  <div className="rounded-lg p-3 bg-primary/10 w-fit mb-4">
                    <Sprout className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Year-Round Green</h3>
                  <p className="text-muted-foreground">Exclusive fertilizer blend keeping your lawn lush and green through all seasons.</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="h-full transition-all duration-300 hover:shadow-lg">
                <CardContent className="pt-6">
                  <div className="rounded-lg p-3 bg-primary/10 w-fit mb-4">
                    <Waves className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold">Pool Servicing</h3>
                    <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                      Launching Soon
                    </Badge>
                  </div>
                  <p className="text-muted-foreground">Automated pool maintenance with smart chemical balancing and cleaning systems.</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Updated Pricing Section */}
      <section className="py-20 bg-background border-t border-border/40">
        <div className="container max-w-7xl">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold mb-4">Simple, Affordable Plans</h2>
            <p className="text-muted-foreground">
              Choose a plan that works for you. All plans include our automated service system
              with one dedicated representative and robotic maintenance equipment.
            </p>
          </div>

          {/* Subscription Tiers Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
            {allPlans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="h-full"
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="h-full"
                >
                  <Card className={`h-full flex flex-col ${plan.id === 'alacarte' ? 'bg-primary/5 border-primary/20' : ''}`}>
                    <CardHeader>
                      <CardTitle className="text-center">
                        <span className={`text-xl font-bold ${plan.id === 'alacarte' ? 'text-primary' : ''}`}>
                          {plan.name}
                        </span>
                      </CardTitle>
                      <div className="text-center mt-2">
                        <span className="text-3xl font-bold text-primary">${plan.price}</span>
                        <span className="text-sm text-muted-foreground ml-1">/month</span>
                      </div>
                      <CardDescription className="text-center mt-2">
                        {plan.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col">
                      <ul className="space-y-2 flex-1 mb-6">
                        {plan.features.slice(0, 4).map((feature, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                            <span className="text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <Button asChild className="w-full mt-auto">
                        <Link href="/services">
                          Join Waitlist
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <motion.section
        className="py-20 bg-primary text-primary-foreground"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
      >
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Transform Your Landscape?
          </h2>
          <p className="mb-8">Experience the future of property maintenance with our automated landscaping solutions.</p>
          <Button
            asChild
            size="lg"
            variant="secondary"
            className="bg-white text-primary hover:bg-white/90"
          >
            <Link href="/waitlist" onClick={scrollToTop}>
              Join Waitlist
            </Link>
          </Button>
        </div>
      </motion.section>
    </div>
  );
};

export default Home;