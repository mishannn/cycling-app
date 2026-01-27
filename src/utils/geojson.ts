import { Feature, LineString } from "geojson";

export function calculateGeoJSONLengthInMeters(
  geojson: Feature<LineString>,
): number {
  // Ensure the input is a valid GeoJSON LineString
  if (
    geojson.type !== "Feature" ||
    geojson.geometry.type !== "LineString" ||
    !Array.isArray(geojson.geometry.coordinates)
  ) {
    throw new Error(
      "Input must be a GeoJSON Feature with a LineString geometry.",
    );
  }

  const coordinates = geojson.geometry.coordinates;

  // Earth's radius in meters
  const earthRadius = 6371000;

  // Helper function to convert degrees to radians
  const toRadians = (degrees: number): number => (degrees * Math.PI) / 180;

  // Function to calculate the distance between two points using the Haversine formula
  const haversineDistance = (coord1: number[], coord2: number[]): number => {
    const [lon1, lat1] = coord1;
    const [lon2, lat2] = coord2;

    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) *
        Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return earthRadius * c;
  };

  // Calculate the total length of the LineString
  let totalLength = 0;

  for (let i = 0; i < coordinates.length - 1; i++) {
    const coord1 = coordinates[i];
    const coord2 = coordinates[i + 1];
    totalLength += haversineDistance(coord1, coord2);
  }

  return totalLength;
}
