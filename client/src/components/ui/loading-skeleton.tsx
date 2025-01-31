import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LoadingSkeletonProps {
  className?: string;
  animate?: boolean;
}

export const LoadingSkeleton = ({ className, animate = true }: LoadingSkeletonProps) => {
  if (!animate) {
    return <div className={cn("bg-muted/50 rounded-md", className)} />;
  }

  return (
    <motion.div
      className={cn("bg-muted/50 rounded-md overflow-hidden relative", className)}
      initial={{ opacity: 0.5 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className="absolute inset-0 -translate-x-full"
        animate={{
          translateX: ["-100%", "100%"]
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "linear"
        }}
        style={{
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)"
        }}
      />
    </motion.div>
  );
};

export default LoadingSkeleton;
