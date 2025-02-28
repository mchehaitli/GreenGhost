import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { CheckCircle2, X, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import PricingCalculator from "@/components/PricingCalculator";
import { useQuery } from "@tanstack/react-query";

type Service = {
  id: number;
  name: string;
  description: string;
  price_per_sqft: number;
  category: 'core' | 'additional';
  active: boolean;
};

const Pricing = () => {
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

  return (
    <div className="min-h-screen bg-background">
      <section className="py-20">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <motion.h1
              className="text-4xl font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Simple, Transparent Pricing
            </motion.h1>
            <motion.p
              className="text-xl text-muted-foreground"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Choose the perfect plan for your lawn. All plans include our innovative service approach
              and dedicated support team.
            </motion.p>
          </div>

          {/* Core Services Section */}
          <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto mb-20">
            {isLoading ? (
              [...Array(3)].map((_, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="p-6 rounded-lg border border-border animate-pulse"
                >
                  <div className="h-8 bg-muted rounded w-1/2 mb-4"></div>
                  <div className="h-6 bg-muted rounded w-1/4 mb-2"></div>
                  <div className="h-4 bg-muted rounded w-3/4 mb-6"></div>
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-4 bg-muted rounded w-full"></div>
                    ))}
                  </div>
                </motion.div>
              ))
            ) : (
              coreServices.map((service, index) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className={`relative h-full flex flex-col`}>
                    <CardHeader>
                      <CardTitle className="text-2xl">{service.name}</CardTitle>
                      <div className="mt-4 flex items-baseline">
                        <span className="text-4xl font-bold">${service.price_per_sqft.toFixed(2)}</span>
                        <span className="text-muted-foreground ml-2">/sq ft</span>
                      </div>
                      <CardDescription className="mt-4">
                        {service.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col">
                      <Button
                        asChild
                        className="w-full mt-auto"
                        variant="outline"
                      >
                        <Link href="/waitlist">
                          Join Waitlist
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>

          {/* Additional Services Section */}
          <motion.div
            className="max-w-7xl mx-auto mb-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Additional Services</h2>
              <p className="text-lg text-muted-foreground">
                Enhance your lawn care experience with our specialized services
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading ? (
                [...Array(6)].map((_, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="p-6 rounded-lg border border-border animate-pulse"
                  >
                    <div className="h-6 bg-muted rounded w-1/2 mb-4"></div>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                  </motion.div>
                ))
              ) : (
                additionalServices.map((service, index) => (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Card className="h-full border-primary/10 hover:border-primary/30 transition-colors duration-300">
                      <CardContent className="p-6">
                        <div className="flex flex-col gap-4">
                          <div>
                            <h3 className="text-xl font-semibold">{service.name}</h3>
                          </div>
                          <div className="mt-auto pt-4 border-t border-border/50">
                            <div className="flex items-baseline gap-1">
                              <span className="text-2xl font-bold text-primary">
                                ${service.price_per_sqft.toFixed(2)}
                              </span>
                              <span className="text-sm text-muted-foreground">/sq ft</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>

          {/* Pricing Calculator Section */}
          <motion.div
            className="max-w-7xl mx-auto"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Calculate Your Custom Service Cost</h2>
              <p className="text-lg text-muted-foreground">
                Get an instant estimate for our automated lawn care services based on your specific needs
              </p>
            </div>
            <PricingCalculator services={services} />
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Pricing;