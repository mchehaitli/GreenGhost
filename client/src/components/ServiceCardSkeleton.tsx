import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { motion } from "framer-motion";

interface ServiceCardSkeletonProps {
  variant?: "pulse" | "shimmer" | "wave";
}

export const ServiceCardSkeleton = ({ variant = "shimmer" }: ServiceCardSkeletonProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="transition-all duration-300">
        <CardHeader>
          <div className="flex items-center gap-2">
            <LoadingSkeleton 
              className="w-10 h-10 rounded-lg" 
              variant={variant}
            />
            <LoadingSkeleton 
              className="h-6 w-32" 
              variant={variant}
            />
          </div>
        </CardHeader>
        <CardContent>
          <LoadingSkeleton 
            className="h-4 w-full mb-2" 
            variant={variant}
          />
          <LoadingSkeleton 
            className="h-4 w-3/4" 
            variant={variant}
          />
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ServiceCardSkeleton;