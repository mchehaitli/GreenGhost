import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { CheckCircle2, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import PricingCalculator from "@/components/PricingCalculator";

const plans = [
  {
    name: "Essential Care",
    price: 149,
    description: "Perfect for standard residential lawns up to 5,000 sq ft",
    features: [
      "Bi-weekly lawn maintenance",
      "Standard mowing and edging",
      "Basic fertilization",
      "Seasonal cleanup",
      "Email support",
    ],
    nonFeatures: [
      "Priority scheduling",
      "Custom care plan",
      "Advanced lawn treatments",
    ],
    popular: false,
  },
  {
    name: "Premium Care",
    price: 249,
    description: "Ideal for larger properties up to 10,000 sq ft",
    features: [
      "Weekly lawn maintenance",
      "Premium mowing and edging",
      "Advanced fertilization program",
      "Seasonal cleanup and preparation",
      "Priority scheduling",
      "Custom care plan",
      "24/7 support",
    ],
    nonFeatures: [],
    popular: true,
  },
  {
    name: "Estate Care",
    price: 399,
    description: "Comprehensive care for luxury estates over 10,000 sq ft",
    features: [
      "Weekly lawn maintenance",
      "Premium mowing and edging",
      "Advanced fertilization program",
      "Full-service lawn treatments",
      "Priority scheduling",
      "Customized care plan",
      "24/7 dedicated support",
      "Landscape consultation",
    ],
    nonFeatures: [],
    popular: false,
  },
];

// Additional services with their prices
const additionalServices = [
  { id: "edging", name: "Edging & Trimming", pricePerSqft: 0.05, description: "Precision edging and trimming for a manicured look along walkways, driveways, and garden beds." },
  { id: "fertilization", name: "Fertilization", pricePerSqft: 0.08, description: "Custom-blended fertilizer application that promotes healthy growth and vibrant color throughout the seasons." },
  { id: "weedControl", name: "Weed Control", pricePerSqft: 0.07, description: "Targeted treatment that eliminates weeds while protecting your lawn and garden plants." },
  { id: "leafRemoval", name: "Leaf Removal", pricePerSqft: 0.06, description: "Efficient removal of fallen leaves to maintain lawn health and appearance during autumn." },
  { id: "soilTesting", name: "Soil Analysis & Treatment", pricePerSqft: 0.04, description: "Comprehensive soil testing with custom amendment recommendations for optimal plant growth." },
  { id: "aerationService", name: "Lawn Aeration", pricePerSqft: 0.06, description: "Core aeration to reduce soil compaction and improve water, nutrient, and oxygen flow to grass roots." },
  { id: "gardenMaintenance", name: "Garden Bed Maintenance", pricePerSqft: 0.08, description: "Complete care for garden beds including weeding, pruning, and seasonal plantings." },
  { id: "mulching", name: "Mulching Service", pricePerSqft: 0.05, description: "Professional mulch application to retain soil moisture, reduce weeds, and enhance landscape appearance." },
  { id: "hardscaping", name: "Hardscape Cleaning", pricePerSqft: 0.06, description: "Thorough cleaning of patios, walkways, and other hardscape elements to maintain their appearance." },
  { id: "seasonalCleanup", name: "Seasonal Cleanup", pricePerSqft: 0.08, description: "Comprehensive cleanup services during spring and fall to prepare your landscape for the coming season." }
];

const Pricing = () => {
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

          <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto mb-20">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className={`relative h-full flex flex-col ${plan.popular ? 'border-primary shadow-lg' : ''}`}>
                  {plan.popular && (
                    <div className="absolute -top-4 left-0 right-0 flex justify-center">
                      <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                        Most Popular
                      </span>
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <div className="mt-4 flex items-baseline">
                      <span className="text-4xl font-bold">${plan.price}</span>
                      <span className="text-muted-foreground ml-2">/month</span>
                    </div>
                    <CardDescription className="mt-4">
                      {plan.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    <ul className="space-y-3 mb-8 flex-1">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                      {plan.nonFeatures.map((feature) => (
                        <li key={feature} className="flex items-start gap-2 text-muted-foreground">
                          <X className="h-5 w-5 flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      asChild
                      className="w-full mt-auto"
                      variant={plan.popular ? "outline" : "outline"}
                    >
                      <Link href="/waitlist">
                        Join Waitlist
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
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
              {additionalServices.map((service, index) => (
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
                              ${service.pricePerSqft.toFixed(2)}
                            </span>
                            <span className="text-sm text-muted-foreground">/sq ft</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
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
            <PricingCalculator />
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Pricing;