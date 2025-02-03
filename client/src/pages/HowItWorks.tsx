import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import {
  ClipboardCheck,
  FileSearch,
  Settings,
  ThumbsUp,
  HeartHandshake,
} from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      icon: <ClipboardCheck className="w-8 h-8" />,
      title: "Get a Free Quote",
      description: "Tell us about your lawn by filling out our quick online form for a personalized estimate."
    },
    {
      icon: <FileSearch className="w-8 h-8" />,
      title: "Lawn Assessment & Custom Plan",
      description: "We'll schedule a visit to map your lawn, understand your needs, and create a custom maintenance plan tailored just for you."
    },
    {
      icon: <Settings className="w-8 h-8" />,
      title: "Automated System Setup",
      description: "Our team will install and configure your smart lawn care system, setting up the perfect schedule for a healthy, beautiful lawn."
    },
    {
      icon: <ThumbsUp className="w-8 h-8" />,
      title: "Effortless Lawn Care",
      description: "Relax and enjoy! Your automated system will take care of your lawn, providing precise care and attention, all managed remotely."
    },
    {
      icon: <HeartHandshake className="w-8 h-8" />,
      title: "Ongoing Support & Monitoring",
      description: "We'll continuously monitor your lawn's health and provide support whenever you need it, ensuring your lawn stays in top condition."
    }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      <section className="bg-background py-20">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              How It Works
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Experience our streamlined process to transform your lawn care
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 bg-background/50">
        <div className="container">
          <div className="grid md:grid-cols-5 gap-8 max-w-6xl mx-auto">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <Card className="h-full bg-card border border-primary/20">
                  <CardContent className="pt-6">
                    <div className="rounded-full p-3 bg-primary/10 w-fit mb-4 mx-auto">
                      <div className="text-primary">
                        {step.icon}
                      </div>
                    </div>
                    <h3 className="font-semibold mb-2 text-center text-primary">{step.title}</h3>
                    <p className="text-sm text-muted-foreground text-center">{step.description}</p>
                    {index < steps.length - 1 && (
                      <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-primary/20" />
                    )}
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
              <Link href="/quote">Get Started Today</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HowItWorks;