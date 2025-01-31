import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Ruler, CreditCard, Phone, Key } from "lucide-react";

// Reference objects with known dimensions for calibration
const CALIBRATION_OBJECTS = [
  {
    id: "creditcard",
    name: "Credit Card",
    width: 85.60, // mm
    height: 53.98, // mm
    icon: CreditCard,
    description: "Standard credit card size"
  },
  {
    id: "phone",
    name: "iPhone",
    width: 71.5, // mm (iPhone 13 dimensions)
    height: 146.7, // mm
    icon: Phone,
    description: "iPhone or similar smartphone"
  },
  {
    id: "key",
    name: "House Key",
    width: 57, // mm (standard house key)
    height: 25, // mm
    icon: Key,
    description: "Standard house key"
  }
];

interface CalibrationData {
  pixelsPerMM: number;
  lastCalibrated: Date;
  referenceObject: string;
}

export const ARCalibrationTool = () => {
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [selectedObject, setSelectedObject] = useState(CALIBRATION_OBJECTS[0]);
  const [calibrationStep, setCalibrationStep] = useState(0);
  const [calibrationData, setCalibrationData] = useState<CalibrationData | null>(null);
  const { toast } = useToast();

  // Guide messages for each calibration step
  const CALIBRATION_STEPS = [
    {
      instruction: "Select a reference object",
      detail: "Choose an object you have handy for calibration"
    },
    {
      instruction: "Place the object in view",
      detail: "Position your reference object in the center of the screen"
    },
    {
      instruction: "Align the overlay",
      detail: "Adjust the overlay to match your object's edges"
    }
  ];

  const startCalibration = () => {
    setIsCalibrating(true);
    setCalibrationStep(0);
    speak("Let's calibrate your device for accurate measurements. First, select a reference object you have nearby.");
  };

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleObjectSelect = (object: typeof CALIBRATION_OBJECTS[0]) => {
    setSelectedObject(object);
    setCalibrationStep(1);
    speak(`Great! Please place your ${object.name} in the center of the screen.`);
  };

  const handleCalibrationComplete = () => {
    // Simulate calibration calculation
    const simulatedPixelsPerMM = Math.random() * 5 + 8; // 8-13 pixels per mm
    
    const newCalibration: CalibrationData = {
      pixelsPerMM: simulatedPixelsPerMM,
      lastCalibrated: new Date(),
      referenceObject: selectedObject.id
    };
    
    setCalibrationData(newCalibration);
    localStorage.setItem('arCalibration', JSON.stringify(newCalibration));
    
    toast({
      title: "Calibration Complete",
      description: "Your device is now calibrated for accurate measurements."
    });
    
    speak("Perfect! Your device is now calibrated and ready for accurate measurements.");
    setIsCalibrating(false);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Ruler className="w-5 h-5" />
          AR Calibration
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!isCalibrating ? (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Calibrate your device for accurate AR measurements using common objects.
            </p>
            <Button
              className="w-full"
              onClick={startCalibration}
            >
              Start Calibration
            </Button>
            {calibrationData && (
              <div className="mt-4 p-4 bg-muted/20 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Last calibrated: {calibrationData.lastCalibrated.toLocaleDateString()}
                  <br />
                  Reference: {CALIBRATION_OBJECTS.find(obj => obj.id === calibrationData.referenceObject)?.name}
                </p>
              </div>
            )}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={calibrationStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="space-y-6">
                {/* Step indicator */}
                <div className="flex justify-center gap-2">
                  {CALIBRATION_STEPS.map((_, index) => (
                    <motion.div
                      key={index}
                      className={`h-2 w-2 rounded-full ${
                        index === calibrationStep ? 'bg-primary' : 'bg-primary/30'
                      }`}
                      animate={index === calibrationStep ? {
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 1, 0.5]
                      } : {}}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  ))}
                </div>

                <div className="text-center">
                  <h3 className="text-lg font-semibold">
                    {CALIBRATION_STEPS[calibrationStep].instruction}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {CALIBRATION_STEPS[calibrationStep].detail}
                  </p>
                </div>

                {calibrationStep === 0 && (
                  <div className="grid grid-cols-1 gap-4">
                    {CALIBRATION_OBJECTS.map((object) => (
                      <Button
                        key={object.id}
                        variant="outline"
                        className="flex items-center justify-between p-4 h-auto"
                        onClick={() => handleObjectSelect(object)}
                      >
                        <div className="flex items-center gap-3">
                          <object.icon className="w-6 h-6" />
                          <div className="text-left">
                            <div className="font-medium">{object.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {object.description}
                            </div>
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                )}

                {calibrationStep === 1 && (
                  <div className="space-y-4">
                    <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <motion.div
                          className="border-2 border-primary"
                          style={{
                            width: selectedObject.width * 2,
                            height: selectedObject.height * 2
                          }}
                          animate={{
                            scale: [1, 1.05, 1],
                            opacity: [0.5, 1, 0.5]
                          }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      </div>
                    </div>
                    <Button
                      className="w-full"
                      onClick={() => setCalibrationStep(2)}
                    >
                      Object Positioned
                    </Button>
                  </div>
                )}

                {calibrationStep === 2 && (
                  <div className="space-y-4">
                    <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <motion.div
                          className="border-2 border-primary"
                          style={{
                            width: selectedObject.width * 2,
                            height: selectedObject.height * 2
                          }}
                          animate={{
                            scale: [1, 1.05, 1],
                            opacity: [0.5, 1, 0.5]
                          }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
                            {[...Array(9)].map((_, i) => (
                              <div key={i} className="border border-primary/30" />
                            ))}
                          </div>
                        </motion.div>
                      </div>
                    </div>
                    <Button
                      className="w-full"
                      onClick={handleCalibrationComplete}
                    >
                      Complete Calibration
                    </Button>
                  </div>
                )}

                {calibrationStep > 0 && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setCalibrationStep(prev => prev - 1);
                      speak(CALIBRATION_STEPS[calibrationStep - 1].instruction);
                    }}
                  >
                    Back
                  </Button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </CardContent>
    </Card>
  );
};

export default ARCalibrationTool;
