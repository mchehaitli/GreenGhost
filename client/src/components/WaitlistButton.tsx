import { useState } from "react";
import { motion } from "framer-motion";
import { Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import WaitlistDialog from "./WaitlistDialog";

const WaitlistButton = () => {
  const [showDialog, setShowDialog] = useState(false);

  return (
    <>
      <motion.div
        className="fixed right-0 top-1/2 -translate-y-1/2 z-50"
        initial={{ x: 100 }}
        animate={{ x: 0 }}
        transition={{ delay: 1 }}
      >
        <Button
          variant="default"
          size="lg"
          className="rounded-l-lg rounded-r-none px-4 py-8 shadow-lg bg-gradient-to-r from-[#10B981] to-[#047857] hover:from-[#10B981]/90 hover:to-[#047857]/90"
          onClick={() => setShowDialog(true)}
        >
          <span className="absolute -rotate-90 flex items-center whitespace-nowrap text-primary-foreground font-semibold">
            <Bot className="mr-2 h-4 w-4 rotate-90" />
            Join Waitlist
          </span>
        </Button>
      </motion.div>
      <WaitlistDialog open={showDialog} onOpenChange={setShowDialog} />
    </>
  );
};

export default WaitlistButton;