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
    <div className="relative w-full h-full bg-muted/5 rounded-lg border">
      <svg
        viewBox="0 0 400 300"
        className="w-full h-full"
        style={{ maxHeight: '400px' }}
      >
        {/* Improved US Map Outline */}
        <path
          d="M60,140 
             L80,120 
             L120,110 
             L180,100 
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
             L60,140"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-muted-foreground/30"
        />

        {/* Plot points for each ZIP code */}
        {points.map((point, index) => (
          <g key={`${point.id}-${index}`}>
            {/* Larger glow effect */}
            <circle
              cx={point.coordinates[0]}
              cy={point.coordinates[1]}
              r="10"
              className="fill-primary/10"
              style={{ filter: 'blur(6px)' }}
            />
            {/* Smaller glow for better contrast */}
            <circle
              cx={point.coordinates[0]}
              cy={point.coordinates[1]}
              r="6"
              className="fill-primary/20"
              style={{ filter: 'blur(3px)' }}
            />
            {/* Main dot */}
            <circle
              cx={point.coordinates[0]}
              cy={point.coordinates[1]}
              r="3"
              className="fill-primary"
            />
          </g>
        ))}
      </svg>
    </div>
  );
};

export default WaitlistMapView;