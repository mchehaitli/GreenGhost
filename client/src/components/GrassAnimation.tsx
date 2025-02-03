import { motion } from "framer-motion";

const GrassAnimation = () => {
  return (
    <div className="absolute bottom-0 left-0 w-full h-32">
      <motion.div
        className="absolute bottom-0 left-0 w-full h-full bg-primary/20"
        style={{
          clipPath: "polygon(0 100%, 5% 90%, 10% 100%, 15% 90%, 20% 100%, 25% 90%, 30% 100%, 35% 90%, 40% 100%, 45% 90%, 50% 100%, 55% 90%, 60% 100%, 65% 90%, 70% 100%, 75% 90%, 80% 100%, 85% 90%, 90% 100%, 95% 90%, 100% 100%)",
        }}
        animate={{
          scaleY: [1, 1.1, 1],
          translateX: [-10, 10, -10],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute bottom-0 left-0 w-full h-full bg-primary/30"
        style={{
          clipPath: "polygon(0 100%, 5% 85%, 10% 100%, 15% 85%, 20% 100%, 25% 85%, 30% 100%, 35% 85%, 40% 100%, 45% 85%, 50% 100%, 55% 85%, 60% 100%, 65% 85%, 70% 100%, 75% 85%, 80% 100%, 85% 85%, 90% 100%, 95% 85%, 100% 100%)",
        }}
        animate={{
          scaleY: [1.1, 1, 1.1],
          translateX: [10, -10, 10],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5
        }}
      />
    </div>
  );
};

export default GrassAnimation;