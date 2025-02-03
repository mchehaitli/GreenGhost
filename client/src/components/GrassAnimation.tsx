import { motion } from "framer-motion";

const GrassAnimation = () => {
  return (
    <div className="absolute bottom-0 left-0 w-full h-32 overflow-hidden pointer-events-none" style={{ zIndex: 1 }}>
      <motion.div
        className="absolute bottom-0 left-0 w-full h-full"
        style={{
          background: "linear-gradient(45deg, var(--primary) 0%, var(--primary)/40 100%)",
          clipPath: "polygon(0% 100%, 100% 100%, 100% 0%, 95% 15%, 90% 5%, 85% 15%, 80% 5%, 75% 15%, 70% 5%, 65% 15%, 60% 5%, 55% 15%, 50% 5%, 45% 15%, 40% 5%, 35% 15%, 30% 5%, 25% 15%, 20% 5%, 15% 15%, 10% 5%, 5% 15%, 0% 0%)"
        }}
        animate={{
          translateX: [-30, 30, -30],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </div>
  );
};

export default GrassAnimation;