import { motion } from "framer-motion";

const GrassAnimation = () => {
  return (
    <div className="absolute bottom-0 left-0 w-full h-32">
      {/* Back layer - taller grass */}
      <motion.div
        className="absolute bottom-0 left-0 w-full h-full bg-primary/20"
        style={{
          clipPath: "polygon(0 100%, 2% 85%, 4% 100%, 6% 80%, 8% 100%, 10% 85%, 12% 100%, 14% 80%, 16% 100%, 18% 85%, 20% 100%, 22% 80%, 24% 100%, 26% 85%, 28% 100%, 30% 80%, 32% 100%, 34% 85%, 36% 100%, 38% 80%, 40% 100%, 42% 85%, 44% 100%, 46% 80%, 48% 100%, 50% 85%, 52% 100%, 54% 80%, 56% 100%, 58% 85%, 60% 100%, 62% 80%, 64% 100%, 66% 85%, 68% 100%, 70% 80%, 72% 100%, 74% 85%, 76% 100%, 78% 80%, 80% 100%, 82% 85%, 84% 100%, 86% 80%, 88% 100%, 90% 85%, 92% 100%, 94% 80%, 96% 100%, 98% 85%, 100% 100%)",
        }}
        animate={{
          scaleY: [1, 1.02, 1],
          translateX: [-5, 5, -5],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Middle layer */}
      <motion.div
        className="absolute bottom-0 left-0 w-full h-full bg-primary/30"
        style={{
          clipPath: "polygon(0 100%, 2% 90%, 4% 100%, 6% 85%, 8% 100%, 10% 90%, 12% 100%, 14% 85%, 16% 100%, 18% 90%, 20% 100%, 22% 85%, 24% 100%, 26% 90%, 28% 100%, 30% 85%, 32% 100%, 34% 90%, 36% 100%, 38% 85%, 40% 100%, 42% 90%, 44% 100%, 46% 85%, 48% 100%, 50% 90%, 52% 100%, 54% 85%, 56% 100%, 58% 90%, 60% 100%, 62% 85%, 64% 100%, 66% 90%, 68% 100%, 70% 85%, 72% 100%, 74% 90%, 76% 100%, 78% 85%, 80% 100%, 82% 90%, 84% 100%, 86% 85%, 88% 100%, 90% 90%, 92% 100%, 94% 85%, 96% 100%, 98% 90%, 100% 100%)",
        }}
        animate={{
          scaleY: [1.02, 1, 1.02],
          translateX: [5, -5, 5],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5
        }}
      />

      {/* Front layer - shorter grass */}
      <motion.div
        className="absolute bottom-0 left-0 w-full h-full bg-primary/40"
        style={{
          clipPath: "polygon(0 100%, 2% 95%, 4% 100%, 6% 92%, 8% 100%, 10% 95%, 12% 100%, 14% 92%, 16% 100%, 18% 95%, 20% 100%, 22% 92%, 24% 100%, 26% 95%, 28% 100%, 30% 92%, 32% 100%, 34% 95%, 36% 100%, 38% 92%, 40% 100%, 42% 95%, 44% 100%, 46% 92%, 48% 100%, 50% 95%, 52% 100%, 54% 92%, 56% 100%, 58% 95%, 60% 100%, 62% 92%, 64% 100%, 66% 95%, 68% 100%, 70% 92%, 72% 100%, 74% 95%, 76% 100%, 78% 92%, 80% 100%, 82% 95%, 84% 100%, 86% 92%, 88% 100%, 90% 95%, 92% 100%, 94% 92%, 96% 100%, 98% 95%, 100% 100%)",
        }}
        animate={{
          scaleY: [1, 1.01, 1],
          translateX: [-3, 3, -3],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
      />
    </div>
  );
};

export default GrassAnimation;