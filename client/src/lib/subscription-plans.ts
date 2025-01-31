import { CheckCircle2 } from "lucide-react";

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  serviceFrequency: string;
  maxBookingsPerMonth: number;
}

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: "basic",
    name: "Basic Automation",
    price: 89.99,
    description: "Essential automated lawn care for smaller properties",
    features: [
      "Automated lawn mowing twice a month",
      "Basic health monitoring",
      "Email support",
      "Up to 2,000 sq ft coverage"
    ],
    serviceFrequency: "Bi-weekly",
    maxBookingsPerMonth: 2
  },
  {
    id: "standard",
    name: "Smart Maintenance",
    price: 149.99,
    description: "Comprehensive care with smart features for medium-sized properties",
    features: [
      "Weekly automated lawn mowing",
      "Smart irrigation monitoring",
      "Priority scheduling",
      "Up to 5,000 sq ft coverage",
      "24/7 system monitoring"
    ],
    serviceFrequency: "Weekly",
    maxBookingsPerMonth: 4
  },
  {
    id: "premium",
    name: "Complete Automation",
    price: 199.99,
    description: "Full-service automated maintenance for larger properties",
    features: [
      "Unlimited automated mowing",
      "Advanced health monitoring",
      "Premium support with dedicated rep",
      "Up to 10,000 sq ft coverage",
      "Custom scheduling",
      "Seasonal treatment planning"
    ],
    serviceFrequency: "Unlimited",
    maxBookingsPerMonth: 8
  }
];
