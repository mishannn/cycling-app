import { Feature, LineString } from "geojson";
import maplibregl from "maplibre-gl";
import { SavedTrip } from "../types/trip";
import { UPDATE_INTERVAL_MS } from "../../utils/constants";

// Generate a unique ID for a route based on its coordinates
export const generateRouteId = (feature: Feature<LineString>): string => {
  // Create a simple hash of the coordinates
  const coords = feature.geometry.coordinates;
  let hash = 0;
  const str = JSON.stringify(coords);
  
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return hash.toString();
};

// Function to start animating the previous trip marker
export const startPreviousTripAnimation = (
  map: maplibregl.Map,
  previousTrip: SavedTrip,
  marker: maplibregl.Marker | null
): ReturnType<typeof setInterval> | null => {
  if (!marker || previousTrip.points.length === 0) return null;
  
  let currentIndex = 0;
  const interval = setInterval(() => {
    if (currentIndex < previousTrip.points.length) {
      const point = previousTrip.points[currentIndex];
      marker.setLngLat([point.lon, point.lat]);
      marker.setRotation(point.bearing);
      currentIndex++;
    } else {
      clearInterval(interval);
    }
  }, UPDATE_INTERVAL_MS);
  
  return interval;
};