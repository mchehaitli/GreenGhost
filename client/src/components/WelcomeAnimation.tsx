import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import { GhostMascot } from "./GhostMascot";
import confetti from "canvas-confetti";

interface WelcomeAnimationProps {
  email: string;
  onComplete: () => void;
}

const WelcomeAnimation = ({ email, onComplete }: WelcomeAnimationProps) => {
  useEffect(() => {
    // Trigger confetti effect
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#22c55e', '#16a34a', '#15803d'],
    });

    // Auto-dismiss after animation
    const timer = setTimeout(() => {
      onComplete();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <motion.div
          className="flex flex-col items-center space-y-6 p-8 rounded-lg bg-card"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: "spring", duration: 0.6 }}
        >
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <GhostMascot size="lg" animated={true} />
          </motion.div>

          <motion.div
            className="text-center space-y-4"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-2xl font-bold">Welcome to GreenGhost Tech! 🌿</h2>
            <p className="text-muted-foreground">
              Thank you for joining our waitlist, <span className="text-primary font-medium">{email}</span>!
            </p>
            <p className="text-sm text-muted-foreground">
              You're now entered for a chance to win a full year of FREE automated lawn maintenance!
            </p>
          </motion.div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default WelcomeAnimation;
