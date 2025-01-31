import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const MEASUREMENT_STEPS = [
  {
    id: 1,
    instruction: "Please stand at one corner of your lawn",
    voicePrompt: "Stand at one corner of your lawn and tap next when ready."
  },
  {
    id: 2,
    instruction: "Point your camera along the edge of your lawn",
    voicePrompt: "Now, point your camera along the edge of your lawn. Keep it steady."
  },
  {
    id: 3,
    instruction: "Walk to the next corner while keeping the camera steady",
    voicePrompt: "Walk slowly to the next corner while keeping your camera pointed at the lawn edge."
  }
];

const MeasurementLauncher = () => {
  const [isMeasuring, setIsMeasuring] = useState(false);
  const { toast } = useToast();
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [measurements, setMeasurements] = useState({
    length: 0,
    width: 0,
    area: 0
  });

  // Initialize speech synthesis
  useEffect(() => {
    if ('speechSynthesis' in window) {
      // Using Web Speech API for browser compatibility
      const synth = window.speechSynthesis;
      const utterance = new SpeechSynthesisUtterance(MEASUREMENT_STEPS[currentStep]?.voicePrompt);
      if (isMeasuring) {
        synth.speak(utterance);
      }
      return () => {
        synth.cancel();
      };
    }
  }, [currentStep, isMeasuring]);

  const handleMeasurement = async () => {
    try {
      const constraints = {
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setVideoStream(stream);
      setIsMeasuring(true);
      setCurrentStep(0);

      // Create and set up video element
      const video = document.createElement('video');
      video.srcObject = stream;
      video.autoplay = true;
      video.playsInline = true;
      video.className = 'w-full h-full object-cover';
      setVideoElement(video);

      toast({
        title: "Camera Access Granted",
        description: "Follow the voice prompts to measure your lawn."
      });
    } catch (err) {
      console.error("Error accessing camera:", err);
      toast({
        variant: "destructive",
        title: "Camera Access Error",
        description: "Please ensure you've granted camera permissions and try again."
      });
    }
  };

  const stopMeasurement = () => {
    if (videoStream) {
      videoStream.getTracks().forEach(track => track.stop());
      setVideoStream(null);
    }
    setIsMeasuring(false);
    setVideoElement(null);
    setCurrentStep(0);
  };

  const handleNextStep = () => {
    if (currentStep < MEASUREMENT_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
      // Simulate measurement (replace with actual AR measurement)
      const simulatedMeasurement = Math.random() * 20 + 10; // 10-30 feet
      if (currentStep === 0) {
        setMeasurements(prev => ({ ...prev, length: simulatedMeasurement }));
      } else if (currentStep === 1) {
        setMeasurements(prev => ({
          ...prev,
          width: simulatedMeasurement,
          area: prev.length * simulatedMeasurement
        }));
      }
    } else {
      // Measurement complete
      toast({
        title: "Measurement Complete",
        description: `Estimated lawn area: ${Math.round(measurements.area)} sq ft`
      });
      stopMeasurement();
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Measure Your Lawn</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">
          Get accurate measurements of your lawn using your device's camera. Our AI-powered
          system will guide you through the process.
        </p>

        <AnimatePresence>
          {!isMeasuring ? (
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
          ) : (
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="aspect-video bg-muted rounded-lg overflow-hidden relative">
                {videoElement && (
                  <div ref={el => el?.appendChild(videoElement)} className="absolute inset-0" />
                )}
                {/* AR Overlay */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-0 border-2 border-primary/50 animate-pulse" />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-4">
                    <p className="text-white text-center font-medium">
                      {MEASUREMENT_STEPS[currentStep]?.instruction}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={stopMeasurement}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1"
                  onClick={handleNextStep}
                >
                  {currentStep === MEASUREMENT_STEPS.length - 1 ? 'Finish' : 'Next Step'}
                </Button>
              </div>

              {measurements.area > 0 && (
                <div className="p-4 bg-primary/5 rounded-lg">
                  <p className="text-center text-sm">
                    Estimated Area: {Math.round(measurements.area)} sq ft
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

export default MeasurementLauncher;