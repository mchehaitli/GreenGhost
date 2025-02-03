import { motion } from "framer-motion";

const GrassAnimation = () => {
  return (
    <div className="absolute bottom-0 left-0 w-full h-12 overflow-hidden">
      <motion.div
        className="absolute bottom-0 left-0 w-full h-full"
        style={{
          background: "linear-gradient(45deg, var(--primary) 0%, var(--primary)/80 100%)",
          clipPath: "polygon(0% 100%, 100% 100%, 100% 40%, 95% 45%, 90% 35%, 85% 45%, 80% 35%, 75% 45%, 70% 35%, 65% 45%, 60% 35%, 55% 45%, 50% 35%, 45% 45%, 40% 35%, 35% 45%, 30% 35%, 25% 45%, 20% 35%, 15% 45%, 10% 35%, 5% 45%, 0% 40%)"
        }}
        animate={{
          translateX: [-10, 10, -10],
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
