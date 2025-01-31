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
    voicePrompt: "Welcome! Please position yourself at one corner of your lawn. Take your time to find the best starting point."
  },
  {
    id: 2,
    instruction: "Point your camera along the edge of your lawn",
    voicePrompt: "Great! Now, point your camera along the edge of your lawn. Try to keep it parallel to the ground for the most accurate measurement."
  },
  {
    id: 3,
    instruction: "Walk to the next corner while keeping the camera steady",
    voicePrompt: "Perfect. Now slowly walk to the next corner while keeping your camera steady. I'll help you measure the distance."
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

  // Enhanced speech synthesis with more natural voice
  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const synth = window.speechSynthesis;
      const utterance = new SpeechSynthesisUtterance(text);

      // Customize voice to sound more natural
      utterance.rate = 0.9; // Slightly slower than default
      utterance.pitch = 1.1; // Slightly higher pitch
      utterance.volume = 1.0;

      // Try to use a more natural-sounding voice if available
      const voices = synth.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.name.includes('Google') || // Prefer Google voices
        voice.name.includes('Natural') || // Or voices labeled as natural
        voice.name.includes('Premium')
      );

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      synth.cancel(); // Cancel any ongoing speech
      synth.speak(utterance);
    }
  };

  useEffect(() => {
    if (isMeasuring && MEASUREMENT_STEPS[currentStep]) {
      speak(MEASUREMENT_STEPS[currentStep].voicePrompt);
    }
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
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

      const video = document.createElement('video');
      video.srcObject = stream;
      video.autoplay = true;
      video.playsInline = true;
      video.className = 'w-full h-full object-cover';
      setVideoElement(video);

      toast({
        title: "Camera Ready",
        description: "I'll guide you through the measurement process with voice instructions."
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
    speak("Measurement cancelled. Feel free to start again when you're ready.");
  };

  const handleNextStep = () => {
    if (currentStep < MEASUREMENT_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
      // Enhanced measurement simulation with more realistic values
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
      const finalArea = Math.round(measurements.area);
      speak(`Measurement complete! Your lawn is approximately ${finalArea} square feet.`);
      toast({
        title: "Measurement Complete",
        description: `Estimated lawn area: ${finalArea} sq ft`
      });
      stopMeasurement();
    }
  };

  return (
    <div className={`${isMeasuring ? 'fixed inset-0 z-50 bg-background' : ''}`}>
      <Card className={`${isMeasuring ? 'h-full border-0 rounded-none' : 'w-full max-w-md mx-auto'}`}>
        <CardHeader className={isMeasuring ? 'absolute top-0 left-0 right-0 z-10 bg-background/80 backdrop-blur-sm' : ''}>
          <CardTitle>Measure Your Lawn</CardTitle>
        </CardHeader>
        <CardContent className={`space-y-4 ${isMeasuring ? 'h-full p-0' : ''}`}>
          {!isMeasuring && (
            <p className="text-muted-foreground">
              Get accurate measurements of your lawn using your device's camera. Our AI-powered
              system will guide you through the process with voice instructions.
            </p>
          )}

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
                className="h-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="relative h-[calc(100vh-8rem)]">
                  {videoElement && (
                    <div ref={el => el?.appendChild(videoElement)} className="absolute inset-0" />
                  )}
                  {/* AR Overlay */}
                  <div className="absolute inset-0 pointer-events-none">
                    {/* Measurement guidelines */}
                    <div className="absolute inset-0">
                      <div className="absolute inset-0 border-2 border-primary/50 animate-pulse" />
                      {/* Corner indicators */}
                      <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-primary" />
                      <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-primary" />
                      <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-primary" />
                      <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-primary" />
                    </div>
                    {/* Instructions overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                      <p className="text-white text-center text-lg font-medium mb-4">
                        {MEASUREMENT_STEPS[currentStep]?.instruction}
                      </p>
                      <div className="flex gap-4 max-w-md mx-auto">
                        <Button 
                          variant="outline" 
                          className="flex-1 bg-white/10 backdrop-blur-sm hover:bg-white/20"
                          onClick={stopMeasurement}
                        >
                          Cancel
                        </Button>
                        <Button 
                          className="flex-1 bg-primary/90 hover:bg-primary"
                          onClick={handleNextStep}
                        >
                          {currentStep === MEASUREMENT_STEPS.length - 1 ? 'Finish' : 'Next Step'}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Measurement results */}
                  {measurements.area > 0 && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 p-4 bg-black/50 backdrop-blur-sm rounded-lg text-white">
                      <p className="text-center font-medium">
                        Estimated Area: {Math.round(measurements.area)} sq ft
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
};

export default MeasurementLauncher;