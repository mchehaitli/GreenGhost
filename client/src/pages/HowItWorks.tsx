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
      <section className="bg-background pt-8 pb-4">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-green-500 via-primary to-emerald-500 bg-clip-text text-transparent animate-fade-in">
              How It Works
            </h1>
            <p className="text-lg text-muted-foreground animate-fade-up">
              Experience our streamlined process to transform your lawn care
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 bg-gradient-to-b from-background via-primary/5 to-background">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 max-w-6xl mx-auto">
            {steps.map((step, index) => (
              <div 
                key={index} 
                className="flex flex-col items-center mt-8"
                style={{ 
                  animationDelay: `${index * 200}ms`,
                }}
              >
                <div className="text-muted-foreground text-xl mb-2 text-center">
                  <span className="font-medium">STEP </span>
                  <span className="text-primary font-bold text-2xl">{index + 1}</span>
                </div>
                <Card className="h-full w-full bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-primary/20 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:scale-105">
                  <CardContent className="pt-6">
                    <div className="rounded-full p-3 bg-gradient-to-br from-primary/10 to-emerald-500/10 w-fit mb-4 mx-auto transition-all duration-300 hover:scale-110 hover:from-primary/20 hover:to-emerald-500/20 group">
                      <div className="text-primary transition-colors duration-300 group-hover:text-emerald-500">
                        {step.icon}
                      </div>
                    </div>
                    <h3 className="font-semibold mb-2 text-center text-primary">{step.title}</h3>
                    <p className="text-sm text-muted-foreground text-center">{step.description}</p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center animate-fade-up" style={{ animationDelay: '1000ms' }}>
            <Button 
              asChild 
              size="lg" 
              className="bg-gradient-to-r from-primary to-emerald-500 hover:from-primary/90 hover:to-emerald-500/90 transition-all duration-300"
            >
              <Link href="/quote">Get Started Today</Link>
            </Button>
          </div>
        </div>
      </section>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes fadeUp {
          from { 
            opacity: 0;
            transform: translateY(20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes stepIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.5s ease forwards;
        }

        .animate-fade-up {
          animation: fadeUp 0.5s ease forwards;
        }

        .animate-step {
          opacity: 0;
          animation: stepIn 0.5s ease forwards;
        }
      `}</style>
    </div>
  );
};

export default HowItWorks;