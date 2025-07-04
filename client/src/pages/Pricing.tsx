import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { CheckCircle2, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface PlanFeature {
  id: number;
  feature: string;
  included: boolean;
  sort_order: number;
  plan_id: number;
  created_at: string;
  updated_at: string;
}

interface PricingPlan {
  id: number;
  name: string;
  price: string;
  description: string;
  billing_period: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
  features: PlanFeature[];
}

interface PricingContent {
  page_title: string;
  page_subtitle: string;
}

const Pricing = () => {
  const { data: plans, isLoading: plansLoading } = useQuery<PricingPlan[]>({
    queryKey: ["/api/pricing/plans"],
  });

  const { data: content, isLoading: contentLoading } = useQuery<PricingContent>({
    queryKey: ["/api/pricing/content"],
  });

  if (plansLoading || contentLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  const includedFeatures = (features: PlanFeature[]) => 
    features.filter(f => f.included).sort((a, b) => a.sort_order - b.sort_order);
  
  const excludedFeatures = (features: PlanFeature[]) => 
    features.filter(f => !f.included).sort((a, b) => a.sort_order - b.sort_order);

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
              {content?.page_title || "Simple, Transparent Pricing"}
            </motion.h1>
            <motion.p
              className="text-xl text-muted-foreground"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {content?.page_subtitle || "Choose the perfect plan for your lawn. All plans include our innovative service approach and dedicated support team."}
            </motion.p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {plans?.map((plan: PricingPlan, index: number) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className={`relative h-full flex flex-col ${index === 1 ? 'border-primary shadow-lg' : ''}`}>
                  {index === 1 && (
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
                      {includedFeatures(plan.features).map((feature: PlanFeature) => (
                        <li key={feature.id} className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                          <span>{feature.feature}</span>
                        </li>
                      ))}
                      {excludedFeatures(plan.features).map((feature: PlanFeature) => (
                        <li key={feature.id} className="flex items-start gap-2 text-muted-foreground">
                          <X className="h-5 w-5 flex-shrink-0 mt-0.5" />
                          <span>{feature.feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      asChild
                      className="w-full mt-auto"
                      variant={index === 1 ? "default" : "outline"}
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
        </div>
      </section>
    </div>
  );
};

export default Pricing;