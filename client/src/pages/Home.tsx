import Hero from "@/components/Hero";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import {
  Bot,
  Activity,
  Waves,
  Sprout,
  CheckCircle2,
} from "lucide-react";
import { motion } from "framer-motion";
import { subscriptionPlans } from "@/lib/subscription-plans";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Home = () => {
  return (
    <div>
      <Hero />

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
                      Launching Summer 2025
                    </Badge>
                  </div>
                  <p className="text-muted-foreground">Automated pool maintenance with smart chemical balancing and cleaning systems.</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-background border-t border-border/40">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold mb-4">Simple, Affordable Plans</h2>
            <p className="text-muted-foreground">
              Choose a plan that works for you. All plans include our automated service system
              with one dedicated representative and robotic maintenance equipment.
            </p>
          </div>
          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, staggerChildren: 0.1 }}
            viewport={{ once: true }}
          >
            {subscriptionPlans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                viewport={{ once: true }}
              >
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="flex justify-between items-start">
                      <span>{plan.name}</span>
                      <span className="text-2xl font-bold text-primary">
                        ${plan.price}
                        <span className="text-sm text-muted-foreground">/mo</span>
                      </span>
                    </CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 mb-6">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button asChild className="w-full">
                      <Link href="/quote">Get Started</Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
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
          <p className="mb-8 max-w-2xl mx-auto">
            Experience the future of property maintenance with our automated landscaping solutions.
          </p>
          <Button
            asChild
            size="lg"
            variant="secondary"
            className="bg-white text-primary hover:bg-white/90"
          >
            <Link href="/quote">Get Your Free Quote</Link>
          </Button>
        </div>
      </motion.section>
    </div>
  );
};

export default Home;