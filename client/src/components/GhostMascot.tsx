import { motion } from "framer-motion";
import { Ghost } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface GhostMascotProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  animated?: boolean;
}

export const GhostMascot = ({ 
  className, 
  size = "md", 
  animated = true 
}: GhostMascotProps) => {
  const [isWaving, setIsWaving] = useState(false);

  const sizes = {
    sm: "w-10 h-10",
    md: "w-14 h-14",
    lg: "w-20 h-20"
  };

  if (!animated) {
    return (
      <div className={cn("text-primary", sizes[size], className)}>
        <Ghost className="w-full h-full" />
      </div>
    );
  }

  return (
    <motion.div
      className={cn("cursor-pointer text-primary mt-4", sizes[size], className)}
      animate={isWaving ? {
        rotate: [0, -20, 20, -20, 20, 0],
        transition: {
          duration: 1,
          ease: "easeInOut"
        }
      } : {
        y: [0, -10, 0], 
        transition: {
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }
      }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={() => {
        if (!isWaving) {
          setIsWaving(true);
          setTimeout(() => setIsWaving(false), 1000);
        }
      }}
    >
      <Ghost className="w-full h-full" />
    </motion.div>
  );
};

export default GhostMascot;