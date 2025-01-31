import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { subscriptionPlans } from "@/lib/subscription-plans";
import { CheckCircle2 } from "lucide-react";

const CircularSubscriptionPlans = () => {
  // Filter out À La Carte plan for the center
  const centerPlan = subscriptionPlans.find(plan => plan.id === "alacarte");
  const rotatingPlans = subscriptionPlans.filter(plan => plan.id !== "alacarte");
  
  // Calculate positions for rotating plans
  const numberOfPlans = rotatingPlans.length;
  const radius = 300; // Adjust based on viewport size
  
  return (
    <div className="relative w-full h-[800px] flex items-center justify-center">
      {/* Center Plan */}
      <motion.div
        className="absolute z-10 transform -translate-x-1/2 -translate-y-1/2"
        animate={{
          scale: [1, 1.05, 1],
          transition: {
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }
        }}
      >
        <Card className="w-[300px] bg-primary/5 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-center">
              <span className="text-2xl font-bold text-primary">{centerPlan?.name}</span>
            </CardTitle>
            <CardDescription className="text-center">
              {centerPlan?.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 mb-6">
              {centerPlan?.features.map((feature, i) => (
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

      {/* Rotating Plans */}
      {rotatingPlans.map((plan, index) => {
        const angle = (index * 2 * Math.PI) / numberOfPlans;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        return (
          <motion.div
            key={plan.id}
            className="absolute"
            style={{
              left: "50%",
              top: "50%",
            }}
            animate={{
              x: x,
              y: y,
              rotate: [0, 360],
              transition: {
                rotate: {
                  duration: 30,
                  repeat: Infinity,
                  ease: "linear"
                },
                x: {
                  duration: 0.5,
                },
                y: {
                  duration: 0.5,
                }
              }
            }}
            whileHover={{
              scale: 1.1,
              zIndex: 20,
            }}
          >
            <Card className="w-[250px] transform -translate-x-1/2 -translate-y-1/2 hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex justify-between items-start">
                  <span>{plan.name}</span>
                  <span className="text-xl font-bold text-primary">
                    ${plan.price}
                    <span className="text-sm text-muted-foreground">/mo</span>
                  </span>
                </CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  {plan.features.slice(0, 3).map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button asChild className="w-full">
                  <Link href="/quote">Select Plan</Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
};

export default CircularSubscriptionPlans;
