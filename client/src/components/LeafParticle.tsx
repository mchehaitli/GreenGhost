import { motion } from "framer-motion";
import { Leaf } from "lucide-react";

const LeafParticle = () => {
  const randomX = Math.random() * 100;
  const randomDelay = Math.random() * 2;
  
  return (
    <motion.div
      className="absolute text-primary/20"
      initial={{ 
        x: `${randomX}vw`,
        y: -20,
        rotate: 0,
        opacity: 0.8
      }}
      animate={{
        y: "110vh",
        x: [`${randomX}vw`, `${randomX + 10}vw`, `${randomX - 10}vw`, `${randomX}vw`],
        rotate: 360,
        opacity: [0.8, 0.6, 0.8]
      }}
      transition={{
        duration: 8,
        delay: randomDelay,
        repeat: Infinity,
        ease: "linear"
      }}
    >
      <Leaf size={24} />
    </motion.div>
  );
};

export const LeafParticles = () => {
  return (
    <div className="fixed inset-0 pointer-events-none">
      {[...Array(6)].map((_, i) => (
        <LeafParticle key={i} />
      ))}
    </div>
  );
};
