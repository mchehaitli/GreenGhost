import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { CheckCircle2, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
    cta: "Get Started",
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
    cta: "Best Value",
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
    cta: "Contact Us",
    popular: false,
  },
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

          <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className={`relative h-full ${plan.popular ? 'border-primary shadow-lg' : ''}`}>
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
                  <CardContent>
                    <ul className="space-y-3 mb-8">
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
                      className="w-full"
                      variant={plan.popular ? "default" : "outline"}
                    >
                      <Link href="/waitlist">
                        {plan.cta}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="mt-20 max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">
              Have Questions About Our Pricing?
            </h2>
            <p className="text-muted-foreground mb-8">
              Our team is here to help you choose the right plan for your needs.
              Contact us for a custom quote or to discuss special requirements.
            </p>
            <Button asChild variant="outline" size="lg">
              <Link href="/contact">Contact Sales</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Pricing;
