import { useState, useEffect } from "react";

interface VerificationCountdownProps {
  onExpire: () => void;
}

export const VerificationCountdown = ({ onExpire }: VerificationCountdownProps) => {
  const [timeLeft, setTimeLeft] = useState(90); // 90 seconds

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onExpire();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onExpire]);

  return (
    <p className="text-sm text-muted-foreground mt-2">
      Time remaining: {Math.floor(timeLeft)} seconds
    </p>
  );
};

export default VerificationCountdown;
