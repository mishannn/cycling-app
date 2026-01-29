import { Feature, LineString } from 'geojson';
import { calculateGeoJSONLengthInMeters } from './geojson';

describe('geojson', () => {
  describe('calculateGeoJSONLengthInMeters', () => {
    it('should calculate the length of a simple line string', () => {
      const feature: Feature<LineString> = {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [
            [0, 0],      // Start point
            [0.001, 0],  // 1st waypoint (east)
            [0.001, 0.001], // 2nd waypoint (north-east)
            [0.002, 0.001], // End point (east)
          ],
        },
        properties: {},
      };

      const length = calculateGeoJSONLengthInMeters(feature);
      expect(length).toBeGreaterThan(0);
    });

    it('should calculate zero length for a single coordinate', () => {
      const feature: Feature<LineString> = {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [
            [0, 0],  // Single point
          ],
        },
        properties: {},
      };

      const length = calculateGeoJSONLengthInMeters(feature);
      expect(length).toBe(0);
    });

    it('should calculate zero length for an empty coordinate array', () => {
      const feature: Feature<LineString> = {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [],
        },
        properties: {},
      };

      const length = calculateGeoJSONLengthInMeters(feature);
      expect(length).toBe(0);
    });

    it('should calculate known distance between two points', () => {
      // Distance between two points approximately 1 degree apart
      // Should be roughly 111 km (111,000 meters)
      const feature: Feature<LineString> = {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [
            [0, 0],  // Origin
            [1, 0],  // 1 degree east
          ],
        },
        properties: {},
      };

      const length = calculateGeoJSONLengthInMeters(feature);
      // Approximately 111 km, allowing for some variance due to Earth's curvature
      expect(length).toBeGreaterThan(110000);
      expect(length).toBeLessThan(112000);
    });

    it('should calculate known distance for equatorial distance', () => {
      // Distance between two points on the equator
      const feature: Feature<LineString> = {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [
            [0, 0],   // Prime meridian at equator
            [0.5, 0], // Half a degree east at equator
          ],
        },
        properties: {},
      };

      const length = calculateGeoJSONLengthInMeters(feature);
      // Approximately 55.5 km (half of 111 km)
      expect(length).toBeGreaterThan(55000);
      expect(length).toBeLessThan(56000);
    });

    it('should calculate known distance for meridional distance', () => {
      // Distance between two points along the same meridian
      const feature: Feature<LineString> = {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [
            [0, 0],   // Equator at prime meridian
            [0, 0.5], // Half a degree north
          ],
        },
        properties: {},
      };

      const length = calculateGeoJSONLengthInMeters(feature);
      // Approximately 55.5 km (half of 111 km)
      expect(length).toBeGreaterThan(55000);
      expect(length).toBeLessThan(56000);
    });

    it('should handle diagonal distances correctly', () => {
      const feature: Feature<LineString> = {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [
            [0, 0],     // Origin
            [1, 1],     // Northeast
          ],
        },
        properties: {},
      };

      const length = calculateGeoJSONLengthInMeters(feature);
      // Diagonal distance should be greater than individual lat/lon distances
      // but less than their sum
      expect(length).toBeGreaterThan(110000); // Greater than 1 degree in one direction
      expect(length).toBeLessThan(225000);    // Less than sum of both directions (~111km + ~111km)
    });

    it('should throw error for non-Feature input', () => {
      const invalidFeature = {
        type: 'NotFeature',
        geometry: {
          type: 'LineString',
          coordinates: [[0, 0], [1, 1]],
        },
        properties: {},
      } as any;

      expect(() => calculateGeoJSONLengthInMeters(invalidFeature))
        .toThrow('Input must be a GeoJSON Feature with a LineString geometry.');
    });

    it('should throw error for non-LineString geometry', () => {
      const invalidFeature: Feature<any> = {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [0, 0],
        },
        properties: {},
      };

      expect(() => calculateGeoJSONLengthInMeters(invalidFeature as Feature<LineString>))
        .toThrow('Input must be a GeoJSON Feature with a LineString geometry.');
    });

    it('should throw error for missing coordinates', () => {
      const invalidFeature: Feature<LineString> = {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: null as any,
        },
        properties: {},
      };

      expect(() => calculateGeoJSONLengthInMeters(invalidFeature))
        .toThrow('Input must be a GeoJSON Feature with a LineString geometry.');
    });

    it('should handle real-world coordinates correctly', () => {
      // Example route: a few city blocks in a grid pattern
      const feature: Feature<LineString> = {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [
            [-73.994453, 40.750042], // Times Square, NYC
            [-73.990100, 40.750042], // East a few blocks
            [-73.990100, 40.753880], // North a few blocks
            [-73.985747, 40.753880], // East a few more blocks
          ],
        },
        properties: {},
      };

      const length = calculateGeoJSONLengthInMeters(feature);
      // This should be a reasonable walking distance (roughly 1-2 km)
      expect(length).toBeGreaterThan(500);
      expect(length).toBeLessThan(2000);
    });

    it('should handle coordinates crossing the antimeridian', () => {
      const feature: Feature<LineString> = {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [
            [179, 0],   // Near International Date Line
            [-179, 0],  // Other side of Date Line
          ],
        },
        properties: {},
      };

      const length = calculateGeoJSONLengthInMeters(feature);
      // This should be a short distance (2 degrees of longitude at equator)
      expect(length).toBeGreaterThan(200000); // ~222 km
      expect(length).toBeLessThan(250000);
    });

    it('should handle polar coordinates correctly', () => {
      const feature: Feature<LineString> = {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [
            [0, 89],    // Near North Pole
            [10, 89],   // 10 degrees east, still near North Pole
          ],
        },
        properties: {},
      };

      const length = calculateGeoJSONLengthInMeters(feature);
      // At high latitudes, longitudinal distances are shorter
      expect(length).toBeGreaterThan(10000);  // At least 10 km
      expect(length).toBeLessThan(50000);     // But less than at equator
    });

    it('should handle a longer route with many waypoints', () => {
      const feature: Feature<LineString> = {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [
            [0, 0],
            [0.1, 0],
            [0.1, 0.1],
            [0.2, 0.1],
            [0.2, 0.2],
            [0.3, 0.2],
            [0.3, 0.3],
            [0.4, 0.3],
            [0.4, 0.4],
            [0.5, 0.4],
          ],
        },
        properties: {},
      };

      const length = calculateGeoJSONLengthInMeters(feature);
      expect(length).toBeGreaterThan(0);
      // Each segment is about 11 km, so total should be around 99 km
      expect(length).toBeGreaterThan(90000);
      expect(length).toBeLessThan(120000);
    });
  });
});