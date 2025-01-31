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
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16"
  };

  const floatingAnimation = animated ? {
    y: [0, -10, 0],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  } : {};

  const waveAnimation = animated && isWaving ? {
    rotate: [0, -20, 20, -20, 20, 0],
    transition: {
      duration: 1,
      ease: "easeInOut"
    }
  } : {};

  const handleClick = () => {
    if (animated && !isWaving) {
      setIsWaving(true);
      setTimeout(() => setIsWaving(false), 1000);
    }
  };

  const Component = animated ? motion.div : "div";

  return (
    <Component
      className={cn("cursor-pointer text-primary", sizes[size], className)}
      animate={waveAnimation || floatingAnimation}
      whileHover={animated ? { scale: 1.1 } : {}}
      whileTap={animated ? { scale: 0.9 } : {}}
      onClick={handleClick}
    >
      <Ghost className="w-full h-full" />
    </Component>
  );
};

export default GhostMascot;