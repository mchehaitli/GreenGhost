import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";

export const ServiceCardSkeleton = () => {
  return (
    <Card className="transition-all duration-300">
      <CardHeader>
        <div className="flex items-center gap-2">
          <LoadingSkeleton className="w-10 h-10 rounded-lg" />
          <LoadingSkeleton className="h-6 w-32" />
        </div>
      </CardHeader>
      <CardContent>
        <LoadingSkeleton className="h-4 w-full mb-2" />
        <LoadingSkeleton className="h-4 w-3/4" />
      </CardContent>
    </Card>
  );
};

export default ServiceCardSkeleton;
