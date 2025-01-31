import { CheckCircle2 } from "lucide-react";

export interface SubscriptionPlan {
  id: string;
  name: string;
  price?: number;
  description: string;
  features: string[];
  serviceFrequency: string;
  maxBookingsPerMonth?: number;
}

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: "alacarte",
    name: "À La Carte Services",
    price: 29.99,
    description: "Customize your automated lawn care experience. Starting at $29.99.",
    features: [
      "Choose individual services",
      "Pay per service",
      "Flexible scheduling",
      "No long-term commitment",
      "Access to all service options"
    ],
    serviceFrequency: "As needed",
  },
  {
    id: "starter",
    name: "Starter Automation",
    price: 39.99,
    description: "Perfect starter package for small yards",
    features: [
      "Monthly automated lawn mowing",
      "Basic system monitoring",
      "Email support",
      "Up to 1,000 sq ft coverage"
    ],
    serviceFrequency: "Monthly",
    maxBookingsPerMonth: 1
  },
  {
    id: "basic",
    name: "Basic Automation",
    price: 69.99,
    description: "Essential automated lawn care for smaller properties",
    features: [
      "Includes all Starter features",
      "Automated lawn mowing twice a month",
      "Basic health monitoring",
      "Up to 2,000 sq ft coverage"
    ],
    serviceFrequency: "Bi-weekly",
    maxBookingsPerMonth: 2
  },
  {
    id: "standard",
    name: "Smart Maintenance",
    price: 129.99,
    description: "Comprehensive care with smart features for medium-sized properties",
    features: [
      "Includes all Basic features",
      "Weekly automated lawn mowing",
      "Smart irrigation monitoring",
      "Priority scheduling",
      "Up to 5,000 sq ft coverage"
    ],
    serviceFrequency: "Weekly",
    maxBookingsPerMonth: 4
  },
  {
    id: "premium",
    name: "Complete Automation",
    price: 199.99,
    description: "Full-service automated maintenance with comprehensive features",
    features: [
      "Includes all Smart Maintenance features",
      "Bi-weekly automated mowing",
      "Advanced health monitoring",
      "Premium support with dedicated rep",
      "Up to 10,000 sq ft coverage",
      "Custom scheduling",
      "Seasonal treatment planning"
    ],
    serviceFrequency: "Bi-weekly",
    maxBookingsPerMonth: 8
  }
];