import { useMemo } from 'react';

interface WaitlistEntry {
  id: number;
  email: string;
  zip_code: string;
}

// Simple function to get approximate coordinates for US ZIP codes
const getApproximateCoordinates = (zipCode: string) => {
  // Map first digit of ZIP to relative coordinates on SVG
  const coordinates: Record<string, [number, number]> = {
    '0': [380, 120], // Northeast
    '1': [350, 140], // Northeast
    '2': [320, 180], // East Coast
    '3': [280, 220], // Southeast
    '4': [240, 160], // Midwest
    '5': [200, 140], // Midwest
    '6': [180, 240], // South Central
    '7': [140, 180], // Central
    '8': [100, 160], // Mountain
    '9': [60, 140],  // West Coast
  };

  return coordinates[zipCode[0]] || [200, 180]; // Center as fallback
};

interface WaitlistMapViewProps {
  entries: WaitlistEntry[];
}

const WaitlistMapView = ({ entries }: WaitlistMapViewProps) => {
  const points = useMemo(() => {
    return entries.map(entry => ({
      ...entry,
      coordinates: getApproximateCoordinates(entry.zip_code)
    }));
  }, [entries]);

  return (
    <div className="relative w-full h-full bg-background rounded-lg border">
      <svg
        viewBox="0 0 400 300"
        className="w-full h-full"
        style={{ maxHeight: '400px' }}
      >
        {/* US Map Fill */}
        <path
          d="M60,140 
             L100,110 
             L160,100 
             L220,90 
             L280,100 
             L340,120 
             L380,140 
             L360,180 
             L340,200 
             L320,220 
             L280,240 
             L240,250 
             L200,260 
             L160,240 
             L120,220 
             L80,180 
             L60,140z"
          className="fill-muted/5"
        />

        {/* US Map Outline - separate from fill for better visibility */}
        <path
          d="M60,140 
             L100,110 
             L160,100 
             L220,90 
             L280,100 
             L340,120 
             L380,140 
             L360,180 
             L340,200 
             L320,220 
             L280,240 
             L240,250 
             L200,260 
             L160,240 
             L120,220 
             L80,180 
             L60,140z"
          fill="none"
          className="stroke-muted-foreground"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Major Region Dividers */}
        <path
          d="M200,90 L200,260 M140,120 L280,240"
          fill="none"
          className="stroke-muted-foreground/30"
          strokeWidth="1"
          strokeDasharray="4,4"
        />

        {/* Plot points for each ZIP code */}
        {points.map((point, index) => (
          <g key={`${point.id}-${index}`}>
            {/* Large outer glow */}
            <circle
              cx={point.coordinates[0]}
              cy={point.coordinates[1]}
              r="15"
              className="fill-primary/5"
              style={{ filter: 'blur(8px)' }}
            />
            {/* Medium glow */}
            <circle
              cx={point.coordinates[0]}
              cy={point.coordinates[1]}
              r="8"
              className="fill-primary/20"
              style={{ filter: 'blur(4px)' }}
            />
            {/* Core dot */}
            <circle
              cx={point.coordinates[0]}
              cy={point.coordinates[1]}
              r="4"
              className="fill-primary"
            />
          </g>
        ))}
      </svg>
    </div>
  );
};

export default WaitlistMapView;