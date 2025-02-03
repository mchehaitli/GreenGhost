import { motion } from "framer-motion";

const GrassAnimation = () => {
  return (
    <div className="absolute bottom-0 left-0 w-full h-24 overflow-hidden pointer-events-none z-10">
      <motion.div
        className="absolute bottom-0 left-0 w-full h-full"
        style={{
          background: "linear-gradient(45deg, var(--primary) 0%, var(--primary)/60 100%)",
          clipPath: "polygon(0% 100%, 100% 100%, 100% 20%, 95% 25%, 90% 15%, 85% 25%, 80% 15%, 75% 25%, 70% 15%, 65% 25%, 60% 15%, 55% 25%, 50% 15%, 45% 25%, 40% 15%, 35% 25%, 30% 15%, 25% 25%, 20% 15%, 15% 25%, 10% 15%, 5% 25%, 0% 20%)"
        }}
        animate={{
          translateX: [-20, 20, -20],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </div>
  );
};

export default GrassAnimation;