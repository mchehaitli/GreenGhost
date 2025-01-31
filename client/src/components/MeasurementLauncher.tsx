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
    voicePrompt: "Hi there! I'm here to help you measure your lawn. Let's start by positioning yourself at any corner of your lawn - pick whichever feels most comfortable. Take your time, I'll wait for you to be ready."
  },
  {
    id: 2,
    instruction: "Point your camera along the edge of your lawn",
    voicePrompt: "Perfect spot! Now, let's get that first measurement. Could you point your camera along the edge of your lawn? Try to keep it parallel to the ground - just like taking a photo of the horizon. Don't worry if it takes a few tries to get it right."
  },
  {
    id: 3,
    instruction: "Walk to the next corner while keeping the camera steady",
    voicePrompt: "You're doing great! For this last part, we'll measure the other side. Just walk slowly to the next corner, keeping your camera steady. I'll help you track the distance as you go. Take it nice and easy, no rush!"
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
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      utterance.volume = 1.0;

      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice =>
        voice.name.includes('Google') ||
        voice.name.includes('Natural') ||
        voice.name.includes('Premium')
      );

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    const initVoices = () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.getVoices();
      }
    };

    initVoices();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.addEventListener('voiceschanged', initVoices);
    }

    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.removeEventListener('voiceschanged', initVoices);
      }
    };
  }, []);

  useEffect(() => {
    if (isMeasuring && MEASUREMENT_STEPS[currentStep]) {
      speak(MEASUREMENT_STEPS[currentStep].voicePrompt);
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
    setMeasurements({ length: 0, width: 0, area: 0 });
    speak("No problem! We can try again whenever you're ready.");
  };

  const handleNextStep = () => {
    if (currentStep < MEASUREMENT_STEPS.length - 1) {
      const simulatedMeasurement = Math.random() * 20 + 10;

      if (currentStep === 0) {
        setMeasurements(prev => ({ ...prev, length: simulatedMeasurement }));
        speak("Great work! I've got that first measurement. Now let's measure the width.");
      } else if (currentStep === 1) {
        setMeasurements(prev => ({
          ...prev,
          width: simulatedMeasurement,
          area: prev.length * simulatedMeasurement
        }));
      }

      setCurrentStep(prev => prev + 1);
    } else {
      const finalArea = Math.round(measurements.area);
      speak(`Fantastic job! Your lawn is approximately ${finalArea} square feet.`);
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
          {!isMeasuring ? (
            <p className="text-muted-foreground">
              Get accurate measurements of your lawn using your device's camera. Our AI-powered
              system will guide you through the process with voice instructions.
            </p>
          ) : null}

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
                className="h-full relative"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="relative h-[calc(100vh-8rem)]">
                  {/* Camera feed container */}
                  <div className="absolute inset-0 z-0">
                    {videoElement && (
                      <div ref={el => el?.appendChild(videoElement)} className="h-full" />
                    )}
                  </div>

                  {/* AR Overlay */}
                  <div className="absolute inset-0 z-10 pointer-events-none">
                    {/* Step-specific AR elements */}
                    {currentStep === 0 && (
                      <>
                        {/* Corner detection guide */}
                        <motion.div
                          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                          animate={{ scale: [0.8, 1.2, 0.8] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <svg width="200" height="200" viewBox="0 0 200 200" className="stroke-primary">
                            <rect
                              x="20" y="20"
                              width="160" height="160"
                              fill="none"
                              strokeWidth="4"
                              strokeDasharray="20,10"
                            />
                            <circle
                              cx="100" cy="100"
                              r="5"
                              fill="currentColor"
                            />
                          </svg>
                        </motion.div>
                      </>
                    )}

                    {currentStep === 1 && (
                      <>
                        {/* Edge measurement guide */}
                        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 flex items-center">
                          <motion.div
                            className="h-1 w-80 bg-primary/50"
                            animate={{ scaleX: [0.8, 1.2, 0.8] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          />
                        </div>
                        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2">
                          <motion.div
                            className="w-full h-1 bg-primary/30"
                            animate={{ opacity: [0.2, 0.5, 0.2] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          />
                        </div>
                      </>
                    )}

                    {currentStep === 2 && (
                      <>
                        {/* Walking measurement guide */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <motion.div
                            className="w-1 h-80 bg-primary/50"
                            animate={{ scaleY: [0.8, 1.2, 0.8] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          />
                          <motion.div
                            className="absolute h-full w-1 bg-primary/30"
                            animate={{ opacity: [0.2, 0.5, 0.2] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          />
                        </div>
                      </>
                    )}

                    {/* Distance markers */}
                    <div className="absolute bottom-32 left-1/2 -translate-x-1/2 flex gap-2">
                      {[...Array(5)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="h-1 w-8 bg-primary"
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1.5, delay: i * 0.2, repeat: Infinity }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Controls overlay */}
                  <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/70 to-transparent p-6">
                    <motion.p
                      className="text-white text-center text-xl font-medium mb-6"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={currentStep}
                    >
                      {MEASUREMENT_STEPS[currentStep]?.instruction}
                    </motion.p>

                    {/* Step indicators */}
                    <div className="flex justify-center gap-2 mb-6">
                      {MEASUREMENT_STEPS.map((_, index) => (
                        <motion.div
                          key={index}
                          className={`h-2 w-2 rounded-full ${
                            index === currentStep ? 'bg-primary' : 'bg-primary/30'
                          }`}
                          animate={index === currentStep ? {
                            scale: [1, 1.2, 1],
                            opacity: [0.5, 1, 0.5]
                          } : {}}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      ))}
                    </div>

                    {/* Control buttons */}
                    <div className="flex gap-4 max-w-md mx-auto">
                      <Button
                        variant="outline"
                        className="flex-1 bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors duration-200"
                        onClick={stopMeasurement}
                      >
                        Cancel
                      </Button>
                      <Button
                        className="flex-1 bg-primary/90 hover:bg-primary transition-colors duration-200"
                        onClick={handleNextStep}
                      >
                        {currentStep === MEASUREMENT_STEPS.length - 1 ? 'Finish' : 'Next Step'}
                      </Button>
                    </div>
                  </div>

                  {/* Measurement results */}
                  {measurements.area > 0 && (
                    <motion.div
                      className="absolute top-4 left-1/2 -translate-x-1/2 p-4 bg-black/50 backdrop-blur-sm rounded-lg text-white z-20"
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <p className="text-center font-medium">
                        {measurements.length > 0 && measurements.width === 0 ? (
                          `Length: ${Math.round(measurements.length)} ft`
                        ) : (
                          <>
                            <span className="block">Area: {Math.round(measurements.area)} sq ft</span>
                            <span className="text-sm text-white/70">
                              ({Math.round(measurements.length)} × {Math.round(measurements.width)} ft)
                            </span>
                          </>
                        )}
                      </p>
                    </motion.div>
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