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
import { Card, CardContent } from "@/components/ui/card";

export const Home = () => {
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
            <h2 className="text-4xl font-bold mb-6">
              Experience the Difference
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Our comprehensive lawn care service combines reliability with excellence, 
              delivering a superior experience that transforms how you think about lawn maintenance.
            </p>
            <div className="space-y-6">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold">Reclaim Your Time</h3>
                  <p className="text-muted-foreground">
                    Transform your weekends into quality time with family and friends while we maintain your lawn to perfection
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold">Unmatched Convenience</h3>
                  <p className="text-muted-foreground">
                    Experience truly hassle-free lawn care with our streamlined service and dedicated support team
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold">Consistent Excellence</h3>
                  <p className="text-muted-foreground">
                    Enjoy a perfectly maintained lawn year-round through our precise and systematic care approach
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold">Cost-Effective Solution</h3>
                  <p className="text-muted-foreground">
                    Benefit from competitive pricing made possible by our innovative service model and efficient operations
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold">Environmental Stewardship</h3>
                  <p className="text-muted-foreground">
                    Support sustainable lawn care practices that reduce environmental impact while maintaining beautiful results
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold">Dependable Service</h3>
                  <p className="text-muted-foreground">
                    Rest assured with our commitment to punctual, consistent service delivery you can always count on
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