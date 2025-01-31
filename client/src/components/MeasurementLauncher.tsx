import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Camera } from "lucide-react";

const MeasurementLauncher = () => {
  const [isMeasuring, setIsMeasuring] = useState(false);

  const handleMeasurement = () => {
    // Request camera access and start measurement
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: { facingMode: "environment" } })
        .then((stream) => {
          // Camera access granted, show measurement UI
          setIsMeasuring(true);
          // TODO: Initialize AR measurement system
        })
        .catch((err) => {
          console.error("Error accessing camera:", err);
          // TODO: Show error message to user
        });
    }
  };

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

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <Button 
            className="w-full" 
            onClick={handleMeasurement}
          >
            <Camera className="mr-2 h-4 w-4" />
            Start Camera Measurement
          </Button>
        </motion.div>

        {isMeasuring && (
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            {/* Camera feed and measurement UI will be rendered here */}
            <div className="aspect-video bg-muted rounded-lg overflow-hidden">
              {/* Camera feed placeholder */}
            </div>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setIsMeasuring(false)}
            >
              Cancel Measurement
            </Button>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};

export default MeasurementLauncher;