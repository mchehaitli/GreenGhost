import { motion } from "framer-motion";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  color?: "primary" | "secondary" | "white";
}

export const LoadingSpinner = ({ 
  size = "md", 
  className,
  color = "primary" 
}: LoadingSpinnerProps) => {
  const sizes = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12"
  };

  const colors = {
    primary: "border-primary",
    secondary: "border-secondary",
    white: "border-white"
  };

  return (
    <div className="flex items-center justify-center">
      <motion.div
        className={`rounded-full border-2 ${colors[color]} border-t-transparent ${sizes[size]} ${className}`}
        animate={{ 
          rotate: 360,
          scale: [1, 1.1, 1]
        }}
        transition={{
          rotate: {
            duration: 1,
            repeat: Infinity,
            ease: "linear"
          },
          scale: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }
        }}
      />
    </div>
  );
};

export default LoadingSpinner;