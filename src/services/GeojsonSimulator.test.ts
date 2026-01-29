import GeojsonSimulator, { Position } from './GeojsonSimulator';
import { Feature } from 'geojson';

// Mock Date.now for consistent testing
const mockDateNow = jest.fn();
const originalDateNow = Date.now;

beforeEach(() => {
  mockDateNow.mockClear();
  mockDateNow.mockReturnValue(1000000);
  Date.now = mockDateNow;
});

afterEach(() => {
  Date.now = originalDateNow;
});

describe('GeojsonSimulator', () => {
  const mockLineStringFeature: Feature = {
    type: 'Feature',
    geometry: {
      type: 'LineString',
      coordinates: [
        [0, 0],      // Start point
        [0.001, 0],  // 1st waypoint
        [0.001, 0.001], // 2nd waypoint
        [0.002, 0.001], // End point
      ],
    },
    properties: {},
  };

  const mockShortLineStringFeature: Feature = {
    type: 'Feature',
    geometry: {
      type: 'LineString',
      coordinates: [
        [0, 0],      // Start point
        [0.0001, 0], // Very short distance
      ],
    },
    properties: {},
  };

  beforeEach(() => {
    mockDateNow.mockClear();
    mockDateNow.mockReturnValue(1000000);
  });

  describe('Constructor', () => {
    it('should create instance with valid LineString feature', () => {
      const simulator = new GeojsonSimulator(mockLineStringFeature, 20);
      expect(simulator).toBeInstanceOf(GeojsonSimulator);
      expect(simulator.speedKmh).toBe(20);
    });

    it('should create instance with default speed', () => {
      const simulator = new GeojsonSimulator(mockLineStringFeature);
      expect(simulator.speedKmh).toBe(10);
    });

    it('should throw error for non-Feature type', () => {
      const invalidFeature = {
        type: 'NotFeature',
        geometry: {
          type: 'LineString',
          coordinates: [[0, 0], [1, 1]],
        },
        properties: {},
      } as any;

      expect(() => new GeojsonSimulator(invalidFeature))
        .toThrow('Переданный GeoJSON должен быть Feature с геометрией LineString');
    });

    it('should throw error for non-LineString geometry', () => {
      const invalidFeature: Feature = {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [0, 0],
        },
        properties: {},
      };

      expect(() => new GeojsonSimulator(invalidFeature))
        .toThrow('Переданный GeoJSON должен быть Feature с геометрией LineString');
    });
  });

  describe('Speed property', () => {
    let simulator: GeojsonSimulator;

    beforeEach(() => {
      simulator = new GeojsonSimulator(mockLineStringFeature);
    });

    it('should set and get speed correctly', () => {
      simulator.speedKmh = 30;
      expect(simulator.speedKmh).toBeCloseTo(30, 5);
    });

    it('should handle speed conversion correctly', () => {
      simulator.speedKmh = 36; // 10 m/s
      expect(simulator.speedKmh).toBe(36);
    });

    it('should convert km/h to m/s correctly', () => {
      simulator.speedKmh = 18; // Should be 5 m/s
      expect(simulator.speed).toBe(5);
    });
  });

  describe('getDistance', () => {
    let simulator: GeojsonSimulator;

    beforeEach(() => {
      simulator = new GeojsonSimulator(mockLineStringFeature);
    });

    it('should calculate distance between two coordinates', () => {
      const coord1 = [0, 0];
      const coord2 = [1, 1];
      const distance = simulator.getDistance(coord1, coord2);

      expect(distance).toBeGreaterThan(0);
      expect(distance).toBeLessThan(200000); // Should be reasonable
    });

    it('should return 0 for same coordinates', () => {
      const coord1 = [0, 0];
      const distance = simulator.getDistance(coord1, coord1);

      expect(distance).toBe(0);
    });

    it('should calculate distance for short segments', () => {
      const coord1 = [0, 0];
      const coord2 = [0.001, 0];
      const distance = simulator.getDistance(coord1, coord2);

      expect(distance).toBeGreaterThan(0);
      expect(distance).toBeLessThan(200); // Should be ~111 meters
    });
  });

  describe('getBearing', () => {
    let simulator: GeojsonSimulator;

    beforeEach(() => {
      simulator = new GeojsonSimulator(mockLineStringFeature);
    });

    it('should calculate bearing between two coordinates', () => {
      const coord1 = [0, 0];
      const coord2 = [1, 0]; // East
      const bearing = simulator.getBearing(coord1, coord2);

      expect(bearing).toBeCloseTo(90, 1);
    });

    it('should calculate north bearing', () => {
      const coord1 = [0, 0];
      const coord2 = [0, 1]; // North
      const bearing = simulator.getBearing(coord1, coord2);

      expect(bearing).toBeCloseTo(0, 1);
    });

    it('should calculate west bearing', () => {
      const coord1 = [0, 0];
      const coord2 = [-1, 0]; // West
      const bearing = simulator.getBearing(coord1, coord2);

      expect(bearing).toBeCloseTo(270, 1);
    });

    it('should calculate south bearing', () => {
      const coord1 = [0, 0];
      const coord2 = [0, -1]; // South
      const bearing = simulator.getBearing(coord1, coord2);

      expect(bearing).toBeCloseTo(180, 1);
    });

    it('should return 0 for same coordinates', () => {
      const coord1 = [0, 0];
      const bearing = simulator.getBearing(coord1, coord1);

      expect(bearing).toBe(0);
    });
  });

  describe('nextStep', () => {
    let simulator: GeojsonSimulator;

    beforeEach(() => {
      simulator = new GeojsonSimulator(mockLineStringFeature, 36); // 10 m/s
    });

    it('should initialize start time on first call', () => {
      mockDateNow.mockReturnValue(1000000);
      const position = simulator.nextStep(1);
      expect(position).toBeDefined();
      expect(simulator.elapsedTime).toBeGreaterThanOrEqual(0);
    });

    it('should return position with correct structure', () => {
      const position = simulator.nextStep(1);

      expect(position).toHaveProperty('lat');
      expect(position).toHaveProperty('lon');
      expect(position).toHaveProperty('bearing');
      expect(typeof position!.lat).toBe('number');
      expect(typeof position!.lon).toBe('number');
      expect(typeof position!.bearing).toBe('number');
    });

    it('should move along the path', () => {
      const pos1 = simulator.nextStep(10); // Use larger time step for more movement
      const pos2 = simulator.nextStep(10);

      expect(pos1).toBeDefined();
      expect(pos2).toBeDefined();
      expect(pos2!.lat).not.toBe(pos1!.lat);
    });

    it('should return null when path is completed', () => {
      // Use very short path and high speed to complete quickly
      const shortSimulator = new GeojsonSimulator(mockShortLineStringFeature, 360);

      // Keep taking steps until we reach the end
      let position: Position | null;
      let steps = 0;
      do {
        position = shortSimulator.nextStep(10);
        steps++;
        if (steps > 100) break; // Safety check
      } while (position !== null);

      expect(position).toBeNull();
    });

    it('should handle small time steps correctly', () => {
      const position = simulator.nextStep(0.1);
      expect(position).toBeDefined();
      expect(position!.lat).toBeCloseTo(0, 6);
    });

    it('should progress through segments correctly', () => {
      // Take multiple steps to progress through first segment
      let position: Position | null;
      let currentSegment = 0;

      do {
        position = simulator.nextStep(5);
        if (position) {
          // Check if we're making progress
          expect(position.lat).toBeGreaterThanOrEqual(0);
        }
      } while (position !== null && currentSegment < 10);

      expect(position).toBeDefined();
    });
  });

  describe('elapsedTime', () => {
    it('should return 0 before first step', () => {
      const simulator = new GeojsonSimulator(mockLineStringFeature);
      expect(simulator.elapsedTime).toBe(0);
    });

    it('should return elapsed time after first step', () => {
      mockDateNow.mockReturnValue(1000000);
      const simulator = new GeojsonSimulator(mockLineStringFeature);

      simulator.nextStep(1);
      mockDateNow.mockReturnValue(1005000); // 5000ms later

      expect(simulator.elapsedTime).toBe(5); // 5000ms = 5s
    });

    it('should calculate elapsed time correctly', () => {
      mockDateNow.mockReturnValue(1000000);
      const simulator = new GeojsonSimulator(mockLineStringFeature);

      simulator.nextStep(1);
      mockDateNow.mockReturnValue(1010000); // 10000ms total

      expect(simulator.elapsedTime).toBe(10); // 10000ms = 10s
    });
  });

  describe('traveledDistance', () => {
    it('should return 0 at the beginning', () => {
      const simulator = new GeojsonSimulator(mockLineStringFeature);
      expect(simulator.traveledDistance).toBe(0);
    });

    it('should increase distance after steps', () => {
      const simulator = new GeojsonSimulator(mockLineStringFeature, 36); // 10 m/s

      simulator.nextStep(1);
      const distance1 = simulator.traveledDistance;

      simulator.nextStep(1);
      const distance2 = simulator.traveledDistance;

      expect(distance1).toBeGreaterThan(0);
      expect(distance2).toBeGreaterThan(distance1);
    });

    it('should calculate partial distance correctly', () => {
      const simulator = new GeojsonSimulator(mockLineStringFeature, 36);

      simulator.nextStep(0.5); // Short time step
      const distance = simulator.traveledDistance;

      expect(distance).toBeGreaterThan(0);
      expect(distance).toBeLessThan(20); // Should be less than full segment
    });
  });

  describe('remainingDistance', () => {
    it('should return total distance at the beginning', () => {
      const simulator = new GeojsonSimulator(mockLineStringFeature);
      const remaining = simulator.remainingDistance;

      expect(remaining).toBeGreaterThan(0);
    });

    it('should decrease after steps', () => {
      const simulator = new GeojsonSimulator(mockLineStringFeature, 36);

      const remaining1 = simulator.remainingDistance;
      simulator.nextStep(1);
      const remaining2 = simulator.remainingDistance;

      expect(remaining2).toBeLessThan(remaining1);
    });

    it('should return 0 when path is completed', () => {
      const shortSimulator = new GeojsonSimulator(mockShortLineStringFeature, 360);

      // Complete the path
      let position: Position | null;
      do {
        position = shortSimulator.nextStep(10);
      } while (position !== null);

      expect(shortSimulator.remainingDistance).toBe(0);
    });
  });

  describe('estimatedTime', () => {
    it('should return estimated time based on remaining distance', () => {
      const simulator = new GeojsonSimulator(mockLineStringFeature, 36); // 10 m/s
      const estimatedTime = simulator.estimatedTime;

      expect(estimatedTime).toBeGreaterThan(0);
      expect(typeof estimatedTime).toBe('number');
    });

    it('should return 0 when path is completed', () => {
      const shortSimulator = new GeojsonSimulator(mockShortLineStringFeature, 360);

      // Complete the path
      let position: Position | null;
      do {
        position = shortSimulator.nextStep(10);
      } while (position !== null);

      expect(shortSimulator.estimatedTime).toBe(0);
    });

    it('should return Infinity when speed is 0', () => {
      const simulator = new GeojsonSimulator(mockLineStringFeature, 0);
      const estimatedTime = simulator.estimatedTime;

      expect(estimatedTime).toBe(Infinity);
    });

    it('should decrease as progress is made', () => {
      const simulator = new GeojsonSimulator(mockLineStringFeature, 36);

      const time1 = simulator.estimatedTime;
      simulator.nextStep(1);
      const time2 = simulator.estimatedTime;

      expect(time2).toBeLessThan(time1);
    });
  });

  describe('Integration tests', () => {
    it('should maintain consistency between traveled and remaining distance', () => {
      const simulator = new GeojsonSimulator(mockLineStringFeature, 36);

      // Take some steps
      simulator.nextStep(1);
      simulator.nextStep(1);

      const totalDistance = simulator.traveledDistance + simulator.remainingDistance;
      const initialRemaining = new GeojsonSimulator(mockLineStringFeature).remainingDistance;

      expect(totalDistance).toBeCloseTo(initialRemaining, 5);
    });

    it('should handle complete path simulation', () => {
      const simulator = new GeojsonSimulator(mockShortLineStringFeature, 36);
      const initialDistance = simulator.remainingDistance;

      let stepCount = 0;
      let position: Position | null;

      do {
        position = simulator.nextStep(1);
        stepCount++;
        expect(simulator.traveledDistance + simulator.remainingDistance)
          .toBeCloseTo(initialDistance, 5);
      } while (position !== null && stepCount < 100);

      expect(simulator.traveledDistance).toBeCloseTo(initialDistance, 5);
      expect(simulator.remainingDistance).toBeCloseTo(0, 5);
    });

    it('should handle very short time steps', () => {
      const simulator = new GeojsonSimulator(mockLineStringFeature, 36);

      // Take many very small steps
      for (let i = 0; i < 100; i++) {
        const position = simulator.nextStep(0.01);
        if (!position) break;

        expect(position.lat).toBeDefined();
        expect(position.lon).toBeDefined();
        expect(position.bearing).toBeGreaterThanOrEqual(0);
        expect(position.bearing).toBeLessThan(360);
      }
    });
  });

  describe('Edge cases', () => {
    it('should handle empty coordinates array gracefully', () => {
      const emptyFeature: Feature = {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [],
        },
        properties: {},
      };

      // Should not throw, but nextStep should return null
      const simulator = new GeojsonSimulator(emptyFeature);
      const position = simulator.nextStep(1);
      expect(position).toBeNull();
    });

    it('should handle single coordinate', () => {
      const singlePointFeature: Feature = {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [[0, 0]],
        },
        properties: {},
      };

      const simulator = new GeojsonSimulator(singlePointFeature);
      const position = simulator.nextStep(1);

      expect(position).toBeNull();
    });

    it('should handle very high speeds', () => {
      const simulator = new GeojsonSimulator(mockLineStringFeature, 36000); // 10 km/s

      const position = simulator.nextStep(1);
      expect(position).toBeDefined();
    });

    it('should handle negative speeds', () => {
      const simulator = new GeojsonSimulator(mockLineStringFeature, -10);

      expect(simulator.speedKmh).toBe(-10);
      // Behavior with negative speed is undefined, but it shouldn't crash
      simulator.nextStep(1); // Just verify it doesn't throw
    });
  });
});