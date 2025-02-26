import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";

interface ServiceCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  tooltip?: string;
}

const ServiceCard = ({ title, description, icon, tooltip }: ServiceCardProps) => {
  return (
    <Card className="h-full transition-all duration-300 hover:scale-[1.02] hover:shadow-lg group">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary/20 group-hover:scale-110">
            {icon}
          </div>
          <div className="flex items-center gap-1">
            <CardTitle className="text-base md:text-lg transition-colors duration-300 group-hover:text-primary">
              {title}
            </CardTitle>
            {tooltip && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help transition-colors hover:text-primary shrink-0 ml-1" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">{tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 pt-0">
        <p className="text-muted-foreground text-sm">{description}</p>
      </CardContent>
    </Card>
  );
};

export default ServiceCard;