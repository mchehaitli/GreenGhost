import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import { subscriptionPlans } from "@/lib/subscription-plans";
import { useState } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

const CustomerPortal = () => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async (planId: string) => {
    setIsLoading(true);
    // TODO: Implement subscription logic
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background py-20">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Affordable automated lawn care powered by cutting-edge robotics.
            Save on labor costs while maintaining premium service quality.
          </p>
        </div>

        <motion.div 
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {subscriptionPlans.map((plan) => (
            <motion.div
              key={plan.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card className={`h-full ${selectedPlan === plan.id ? 'border-primary' : ''}`}>
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
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 pt-4 border-t">
                    <div className="text-sm text-muted-foreground">
                      <p>Service Frequency: {plan.serviceFrequency}</p>
                      <p>Maximum Bookings: {plan.maxBookingsPerMonth}/month</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <LoadingSpinner size="sm" className="mr-2" />
                    ) : null}
                    Subscribe Now
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <div className="mt-12 text-center">
          <p className="text-muted-foreground mb-4">
            All plans include our automated service system with one dedicated representative
            and robotic maintenance equipment.
          </p>
          <Button variant="outline" size="lg">
            Schedule a Demo
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CustomerPortal;
