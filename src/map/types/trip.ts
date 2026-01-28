export interface SavedTripPoint {
  lat: number;
  lon: number;
  bearing: number;
  timestamp: number;
}

export interface SavedTrip {
  routeId: string;
  points: SavedTripPoint[];
  startTime: number;
  endTime: number;
  totalTime: number;
}