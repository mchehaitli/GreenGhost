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
    '0': [400, 150], // Northeast
    '1': [380, 180], // Northeast
    '2': [350, 250], // East Coast
    '3': [300, 300], // Southeast
    '4': [250, 200], // Midwest
    '5': [200, 180], // Midwest
    '6': [200, 300], // South Central
    '7': [150, 200], // Central
    '8': [100, 150], // Mountain
    '9': [50, 200],  // West Coast
  };

  return coordinates[zipCode[0]] || [250, 200]; // Center as fallback
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
    <div className="relative w-full h-full bg-muted/10 rounded-lg">
      <svg
        viewBox="0 0 450 350"
        className="w-full h-full"
        style={{ maxHeight: '400px' }}
      >
        {/* Simplified US Map Outline */}
        <path
          d="M50,150 L100,100 L200,80 L300,90 L400,150 L380,200 L350,250 L300,300 L200,320 L100,250 L50,150"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-muted-foreground/20"
        />

        {/* Plot points for each ZIP code */}
        {points.map((point, index) => (
          <g key={`${point.id}-${index}`}>
            {/* Glowing effect */}
            <circle
              cx={point.coordinates[0]}
              cy={point.coordinates[1]}
              r="8"
              className="fill-primary/20"
              style={{ filter: 'blur(4px)' }}
            />
            {/* Main dot */}
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