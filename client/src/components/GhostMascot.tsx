import { motion } from "framer-motion";
import { Ghost } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface GhostMascotProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const GhostMascot = ({ className, size = "md" }: GhostMascotProps) => {
  const [isWaving, setIsWaving] = useState(false);

  const sizes = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16"
  };

  const floatingAnimation = {
    y: [0, -10, 0],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };

  const waveAnimation = {
    rotate: [0, -20, 20, -20, 20, 0],
    transition: {
      duration: 1,
      ease: "easeInOut"
    }
  };

  const handleClick = () => {
    if (!isWaving) {
      setIsWaving(true);
      setTimeout(() => setIsWaving(false), 1000);
    }
  };

  return (
    <motion.div
      className={cn("cursor-pointer text-primary", sizes[size], className)}
      animate={isWaving ? waveAnimation : floatingAnimation}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={handleClick}
    >
      <Ghost className="w-full h-full" />
    </motion.div>
  );
};

export default GhostMascot;
