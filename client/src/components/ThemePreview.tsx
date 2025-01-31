import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ThemePreviewProps {
  currentTheme: {
    primary: string;
    variant: string;
    appearance: string;
  };
}

export function ThemePreview({ currentTheme }: ThemePreviewProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  
  const startAnimation = () => {
    setIsAnimating(true);
  };

  useEffect(() => {
    if (isAnimating) {
      const timer = setTimeout(() => setIsAnimating(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isAnimating]);

  return (
    <div className="relative w-full max-w-md mx-auto">
      <Card className="p-6 space-y-4">
        <motion.div
          className="w-full h-32 rounded-lg overflow-hidden"
          animate={isAnimating ? {
            backgroundColor: [
              "hsl(var(--primary))",
              "hsl(var(--secondary))",
              "hsl(var(--accent))",
              "hsl(var(--primary))"
            ]
          } : {}}
          transition={{
            duration: 3,
            ease: "easeInOut",
            times: [0, 0.33, 0.66, 1],
            repeat: 0
          }}
        >
          <motion.div
            className={cn(
              "w-full h-full flex items-center justify-center",
              "text-primary-foreground font-bold text-xl"
            )}
            animate={isAnimating ? {
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            } : {}}
            transition={{ duration: 3, ease: "easeInOut" }}
          >
            Theme Preview
          </motion.div>
        </motion.div>
        
        <div className="flex justify-center">
          <Button
            onClick={startAnimation}
            variant="outline"
            className="relative overflow-hidden"
            disabled={isAnimating}
          >
            {isAnimating ? "Previewing..." : "Preview Animation"}
            {isAnimating && (
              <motion.div
                className="absolute inset-0 bg-primary/10"
                animate={{
                  x: ["0%", "100%"]
                }}
                transition={{
                  duration: 1,
                  ease: "linear",
                  repeat: 2
                }}
              />
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}
