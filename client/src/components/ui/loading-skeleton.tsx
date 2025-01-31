import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LoadingSkeletonProps {
  className?: string;
  animate?: boolean;
  variant?: "pulse" | "shimmer" | "wave";
}

export const LoadingSkeleton = ({ 
  className, 
  animate = true,
  variant = "shimmer" 
}: LoadingSkeletonProps) => {
  if (!animate) {
    return <div className={cn("bg-muted/50 rounded-md", className)} />;
  }

  const variants = {
    pulse: {
      opacity: [0.4, 0.7, 0.4],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    },
    shimmer: {
      x: ["-100%", "100%"],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "linear"
      }
    },
    wave: {
      opacity: [0.4, 0.7, 0.4],
      scale: [1, 1.02, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  if (variant === "shimmer") {
    return (
      <motion.div
        className={cn("bg-muted/50 rounded-md overflow-hidden relative", className)}
        initial={{ opacity: 0.5 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <motion.div
          className="absolute inset-0 -translate-x-full"
          animate={variants.shimmer}
          style={{
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)"
          }}
        />
      </motion.div>
    );
  }

  return (
    <motion.div
      className={cn("bg-muted/50 rounded-md", className)}
      initial={{ opacity: 0.5 }}
      animate={variant === "pulse" ? variants.pulse : variants.wave}
    />
  );
};

export default LoadingSkeleton;