import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Dimensions,
} from 'react-native';
import { Camera, useCameraDevices } from 'react-native-vision-camera';
import { useAnimatedProps } from 'react-native-reanimated';
import Tts from 'react-native-tts';
import Voice from '@react-native-community/voice';

const MEASUREMENT_STEPS = [
  {
    id: 1,
    instruction: "Please stand at one corner of your lawn",
    voicePrompt: "Stand at one corner of your lawn and tap the screen when ready."
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

const ARMeasurement = () => {
  const camera = useRef(null);
  const devices = useCameraDevices();
  const device = devices.back;
  
  const [hasPermission, setHasPermission] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [measurements, setMeasurements] = useState({
    length: 0,
    width: 0,
    area: 0
  });

  useEffect(() => {
    // Request camera permissions
    (async () => {
      const cameraPermission = await Camera.requestCameraPermission();
      setHasPermission(cameraPermission === 'authorized');
    })();

    // Initialize TTS
    Tts.setDefaultLanguage('en-US');
    Tts.setDefaultRate(0.5);
    
    // Speak initial instruction
    if (MEASUREMENT_STEPS[0]) {
      Tts.speak(MEASUREMENT_STEPS[0].voicePrompt);
    }

    return () => {
      Tts.stop();
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const handleMeasurement = async () => {
    if (!camera.current) return;

    try {
      // Take a photo for processing
      const photo = await camera.current.takePhoto({
        qualityPrioritization: 'speed',
        flash: 'off',
      });

      // Process the photo for measurements
      // This would typically involve ML Kit or other computer vision processing
      // For now, we'll simulate the measurement
      const simulatedMeasurement = Math.random() * 20 + 10; // 10-30 feet

      if (currentStep === 1) {
        setMeasurements(prev => ({
          ...prev,
          length: simulatedMeasurement
        }));
      } else if (currentStep === 2) {
        setMeasurements(prev => ({
          ...prev,
          width: simulatedMeasurement,
          area: prev.length * simulatedMeasurement
        }));
      }

      // Move to next step
      if (currentStep < MEASUREMENT_STEPS.length - 1) {
        setCurrentStep(prev => prev + 1);
        Tts.speak(MEASUREMENT_STEPS[currentStep + 1].voicePrompt);
      }
    } catch (error) {
      console.error('Error during measurement:', error);
      Tts.speak('An error occurred. Please try again.');
    }
  };

  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>No camera permission</Text>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Loading camera...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={camera}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        photo={true}
      />
      
      <View style={styles.overlay}>
        <Text style={styles.instruction}>
          {MEASUREMENT_STEPS[currentStep]?.instruction}
        </Text>
        
        <TouchableOpacity
          style={styles.captureButton}
          onPress={handleMeasurement}
        >
          <Text style={styles.captureButtonText}>
            {currentStep === MEASUREMENT_STEPS.length - 1 ? 'Finish' : 'Next'}
          </Text>
        </TouchableOpacity>

        {measurements.area > 0 && (
          <View style={styles.results}>
            <Text style={styles.resultsText}>
              Estimated Area: {Math.round(measurements.area)} sq ft
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  text: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  instruction: {
    color: 'white',
    fontSize: 24,
    textAlign: 'center',
    marginTop: 50,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 20,
    borderRadius: 10,
  },
  captureButton: {
    alignSelf: 'center',
    marginBottom: 50,
    backgroundColor: '#22C55E',
    padding: 20,
    borderRadius: 40,
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  results: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 20,
    borderRadius: 10,
  },
  resultsText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
  },
});

export default ARMeasurement;
