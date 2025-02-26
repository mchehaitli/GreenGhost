import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import { X } from "lucide-react";
import { GhostMascot } from "./GhostMascot";
import { Button } from "@/components/ui/button";
import confetti from "canvas-confetti";

interface WelcomeAnimationProps {
  email?: string; // Made email optional
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
  }, []); // Only trigger once when mounted

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <motion.div
          className="relative flex flex-col items-center space-y-6 p-8 rounded-lg bg-card shadow-lg"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: "spring", duration: 0.6 }}
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2"
            onClick={onComplete}
          >
            <X className="h-4 w-4" />
          </Button>

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
            <h2 className="text-2xl font-bold">Welcome to GreenGhost Tech!</h2>
            <p className="text-muted-foreground">
              Thank you for joining our waitlist{email ? <> , <span className="text-primary font-medium">{email}</span></> : ""}!
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