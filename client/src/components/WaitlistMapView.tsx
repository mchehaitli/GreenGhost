import { useMemo } from 'react';
import Map, { Marker } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface WaitlistEntry {
  id: number;
  email: string;
  zip_code: string;
}

// Simple function to get approximate coordinates from ZIP code first digit
// This is a simplified version - in production you'd want to use a proper geocoding service
const getApproximateCoordinates = (zipCode: string) => {
  // This is a very rough approximation for US ZIP codes
  const regions: Record<string, [number, number]> = {
    '0': [-73.935242, 41.850033], // Northeast
    '1': [-71.058880, 42.360082], // Northeast
    '2': [-77.036871, 38.907192], // East Coast
    '3': [-84.387982, 33.748995], // Southeast
    '4': [-84.512020, 39.103118], // Midwest
    '5': [-93.265011, 44.977753], // Midwest
    '6': [-97.743061, 30.267153], // South Central
    '7': [-93.297850, 37.208957], // Central
    '8': [-104.990251, 39.739236], // Mountain
    '9': [-122.419416, 37.774929], // West Coast
  };
  
  return regions[zipCode[0]] || [-98.5795, 39.8283]; // US center as fallback
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
    <Map
      mapboxAccessToken="pk.eyJ1IjoiZ3JlZW5naG9zdHRlY2giLCJhIjoiY2xybjBqemx5MDJraDJrcGR4Z2g1Z3ZoYiJ9.mCLHB8FzkX_qXR5pKG_TFg"
      initialViewState={{
        longitude: -98.5795,
        latitude: 39.8283,
        zoom: 3
      }}
      style={{ width: '100%', height: '100%' }}
      mapStyle="mapbox://styles/mapbox/dark-v11"
    >
      {points.map((point, index) => (
        <Marker
          key={`${point.id}-${index}`}
          longitude={point.coordinates[0]}
          latitude={point.coordinates[1]}
        >
          <div className="w-4 h-4 bg-primary rounded-full opacity-75 hover:opacity-100 transition-opacity" />
        </Marker>
      ))}
    </Map>
  );
};

export default WaitlistMapView;
