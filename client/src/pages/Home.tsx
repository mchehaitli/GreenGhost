import Hero from "@/components/Hero";
import ServiceCard from "@/components/ServiceCard";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  Bot,
  Sprout,
  Scissors,
  TreePine,
  Activity,
  Clock,
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
      <section className="py-20 bg-slate-50">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Choose GreenGhost Tech?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <ServiceCard
              icon={<Bot className="w-6 h-6" />}
              title="Automated Precision"
              description="Advanced robotics and AI systems for precise lawn care and maintenance."
            />
            <ServiceCard
              icon={<Activity className="w-6 h-6" />}
              title="Smart Monitoring"
              description="Real-time monitoring of your landscape's health and maintenance needs."
            />
            <ServiceCard
              icon={<Clock className="w-6 h-6" />}
              title="24/7 Service"
              description="Automated systems work around the clock to maintain your property."
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-background">
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
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, staggerChildren: 0.1 }}
          >
            {subscriptionPlans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
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

      {/* Services Preview */}
      <section className="py-20">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Services</h2>
            <p className="text-muted-foreground">
              Comprehensive landscaping solutions powered by cutting-edge technology
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ServiceCard
              icon={<Scissors className="w-6 h-6" />}
              title="Lawn Maintenance"
              description="Automated mowing, edging, and trimming services for a perfectly maintained lawn."
            />
            <ServiceCard
              icon={<Sprout className="w-6 h-6" />}
              title="Garden Care"
              description="Smart irrigation and plant health monitoring systems for thriving gardens."
            />
            <ServiceCard
              icon={<TreePine className="w-6 h-6" />}
              title="Landscape Design"
              description="Custom landscape design with sustainable and low-maintenance solutions."
            />
          </div>
          <div className="text-center mt-12">
            <Button asChild size="lg">
              <Link href="/services">View All Services</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Transform Your Landscape?
          </h2>
          <p className="mb-8 max-w-2xl mx-auto">
            Get started with our automated landscaping solutions today and
            experience the future of property maintenance.
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
      </section>
    </div>
  );
};

export default Home;