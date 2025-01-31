import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import MeasurementLauncher from "./MeasurementLauncher";

interface AdditionalService {
  id: string;
  name: string;
  pricePerSqft: number;
}

const additionalServices: AdditionalService[] = [
  { id: "edging", name: "Edging & Trimming", pricePerSqft: 0.05 },
  { id: "fertilization", name: "Fertilization", pricePerSqft: 0.08 },
  { id: "weedControl", name: "Weed Control", pricePerSqft: 0.07 },
  { id: "leafRemoval", name: "Leaf Removal", pricePerSqft: 0.06 },
  { id: "pestControl", name: "Pest Control", pricePerSqft: 0.09 },
  { id: "soilTesting", name: "Soil Analysis & Treatment", pricePerSqft: 0.04 },
  { id: "aerationService", name: "Lawn Aeration", pricePerSqft: 0.06 },
  { id: "gardenMaintenance", name: "Garden Bed Maintenance", pricePerSqft: 0.08 },
  { id: "mulching", name: "Mulching Service", pricePerSqft: 0.05 },
  { id: "treeService", name: "Tree Health Monitoring", pricePerSqft: 0.07 },
  { id: "hardscaping", name: "Hardscape Cleaning", pricePerSqft: 0.06 },
  { id: "seasonalCleanup", name: "Seasonal Cleanup", pricePerSqft: 0.08 }
];

const frequencies = [
  { value: "weekly", label: "Weekly", multiplier: 1 },
  { value: "biweekly", label: "Bi-Weekly", multiplier: 0.85 },
  { value: "monthly", label: "Monthly", multiplier: 0.7 },
];

const PricingCalculator = () => {
  const [lawnSize, setLawnSize] = useState<number>(1000);
  const [frequency, setFrequency] = useState<string>("monthly");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [totalPrice, setTotalPrice] = useState<number>(0);

  const calculatePrice = () => {
    setIsCalculating(true);

    // Base price calculation
    const basePricePerSqft = 0.10; // $0.10 per sq ft
    const frequencyMultiplier = frequencies.find(f => f.value === frequency)?.multiplier || 1;

    // Calculate base price
    let basePrice = lawnSize * basePricePerSqft * frequencyMultiplier;

    // Add costs for additional services
    const additionalCosts = selectedServices.reduce((total, serviceId) => {
      const service = additionalServices.find(s => s.id === serviceId);
      if (service) {
        return total + (lawnSize * service.pricePerSqft);
      }
      return total;
    }, 0);

    // Simulate API call delay
    setTimeout(() => {
      setTotalPrice(basePrice + additionalCosts);
      setIsCalculating(false);
    }, 500);
  };

  useEffect(() => {
    calculatePrice();
  }, [lawnSize, frequency, selectedServices]);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Service Price Calculator</CardTitle>
        <CardDescription>
          Calculate the cost of our automated lawn care services based on your specific needs
        </CardDescription>
      </CardHeader>
      <CardContent>
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Add Measurement Launcher */}
          <div className="space-y-2">
            <Label>Lawn Size</Label>
            <MeasurementLauncher />
            <p className="text-sm text-muted-foreground mt-2">
              Use our AI measurement tool or enter the size manually below
            </p>
            <Input
              type="number"
              min="100"
              value={lawnSize}
              onChange={(e) => setLawnSize(Number(e.target.value))}
              className="w-full mt-2"
              placeholder="Enter lawn size in sq ft"
            />
          </div>

          {/* Service Frequency */}
          <div className="space-y-2">
            <Label>Service Frequency</Label>
            <Select
              value={frequency}
              onValueChange={setFrequency}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                {frequencies.map((freq) => (
                  <SelectItem key={freq.value} value={freq.value}>
                    {freq.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Additional Services */}
          <div className="space-y-2">
            <Label>Additional Services</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {additionalServices.map((service) => (
                <div key={service.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={service.id}
                    checked={selectedServices.includes(service.id)}
                    onCheckedChange={(checked) => {
                      setSelectedServices(
                        checked
                          ? [...selectedServices, service.id]
                          : selectedServices.filter((id) => id !== service.id)
                      );
                    }}
                  />
                  <Label
                    htmlFor={service.id}
                    className="text-sm cursor-pointer"
                  >
                    {service.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Price Display */}
          <motion.div
            className="p-4 bg-primary/5 rounded-lg text-center"
            animate={{ scale: isCalculating ? 0.98 : 1 }}
            transition={{ duration: 0.2 }}
          >
            {isCalculating ? (
              <div className="flex items-center justify-center space-x-2">
                <LoadingSpinner size="sm" />
                <span>Calculating...</span>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-2xl font-bold text-primary">
                  ${totalPrice.toFixed(2)}
                  <span className="text-sm font-normal text-muted-foreground">
                    {frequency === "weekly" ? "/week" : frequency === "biweekly" ? "/2 weeks" : "/month"}
                  </span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Estimated price based on selected options
                </p>
              </div>
            )}
          </motion.div>
        </motion.div>
      </CardContent>
    </Card>
  );
};

export default PricingCalculator;