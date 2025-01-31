import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import QRCode from "react-qr-code";

const MeasurementLauncher = () => {
  const [showQR, setShowQR] = useState(false);
  
  // Generate a unique measurement session URL
  const measurementUrl = `${window.location.origin}/measure/${Date.now()}`;
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Measure Your Lawn</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">
          Get accurate measurements of your lawn using your phone's camera. Our AI-powered
          system will guide you through the process with voice prompts.
        </p>
        
        {!showQR ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Button 
              className="w-full" 
              onClick={() => setShowQR(true)}
            >
              Start Measurement
            </Button>
          </motion.div>
        ) : (
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <div className="bg-white p-4 rounded-lg">
              <QRCode 
                value={measurementUrl}
                className="w-full h-auto"
              />
            </div>
            <p className="text-sm text-center text-muted-foreground">
              Scan this QR code with your phone's camera to start the measurement process
            </p>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setShowQR(false)}
            >
              Cancel
            </Button>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};

export default MeasurementLauncher;
