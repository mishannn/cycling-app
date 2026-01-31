import React, { useEffect, useMemo, useRef, useState } from "react";
import GeojsonSimulator, { Position } from "../services/GeojsonSimulator";
import {
  TIME_UPDATE_INTERVAL_MS,
} from "../utils/constants";
import { Feature, LineString } from "geojson";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useThrottle } from "ahooks";
import { SavedTrip, SavedTripPoint } from "./types/trip";
import { generateRouteId } from "./utils/helpers";
import {
  loadPreviousTripData,
  initializeMap,
  updateSimulatorSpeed,
  startPositionTracking,
  updateMarkerPosition,
  easeMapToPosition
} from "./utils/mapUtils";
import SpeedDisplay from "./components/SpeedDisplay";
import { Box } from "@mui/material";
import { UserData } from "./types/userData";

const MapWithMovingMarker: React.FC<{
  feature: Feature<LineString>;
  speed: number;
  heartRate: number;
  cadence: number;
  power: number;
  userData?: UserData;
}> = ({ feature, speed, heartRate, cadence, power, userData }) => {
  const simulator = useMemo(() => new GeojsonSimulator(feature, 0), [feature]);
  const routeId = useMemo(() => generateRouteId(feature), [feature]);

  // Previous trip state
  const [previousTrip, setPreviousTrip] = useState<SavedTrip | null>(null);
  const previousTripMarkerRef = useRef<maplibregl.Marker | null>(null);
  const previousTripIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tripRecordingRef = useRef<SavedTripPoint[]>([]);
  const tripStartTimeRef = useRef<number>(Date.now());

  // Load previous trip data when component mounts
  useEffect(() => {
    loadPreviousTripData(routeId, setPreviousTrip);
  }, [routeId]);

  // Initialize map
  const mapRef = useRef<maplibregl.Map>(null);
  const markerRef = useRef<maplibregl.Marker>(null);
  const mapContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainer.current) {
      const msg = "Map container is not ready";
      console.error(msg);
      alert(msg);
      return;
    }

    // Initialize the map using our utility function
    const { map, marker } = initializeMap(
      mapContainer.current,
      feature,
      previousTrip,
      (marker) => { previousTripMarkerRef.current = marker; },
      (interval) => { previousTripIntervalRef.current = interval; }
    );

    mapRef.current = map;
    markerRef.current = marker;

    return () => {
      // Clean up intervals and markers
      if (previousTripIntervalRef.current) {
        clearInterval(previousTripIntervalRef.current);
      }
      mapRef.current = null;
      map.remove();
    };
  }, [feature, previousTrip]);

  // Update speed
  useEffect(() => {
    updateSimulatorSpeed(simulator, speed);
  }, [simulator, speed]);

  // Watch position and record trip
  const [position, setPosition] = useState<Position>({
    lon: feature.geometry.coordinates[0][0],
    lat: feature.geometry.coordinates[0][1],
    bearing: 0
  });

  useEffect(() => {
    const interval = startPositionTracking(
      simulator,
      routeId,
      tripRecordingRef,
      tripStartTimeRef,
      setPosition
    );

    return () => clearInterval(interval);
  }, [simulator, routeId]);

  useEffect(() => {
    updateMarkerPosition(markerRef.current, position);
  }, [position]);

  const throttledPosition = useThrottle(position, { wait: 1000 });
  useEffect(() => {
    easeMapToPosition(mapRef.current, throttledPosition);
  }, [throttledPosition]);

  // Update estimate time
  const throttledTime = useThrottle(simulator.estimatedTime, { wait: TIME_UPDATE_INTERVAL_MS });

  return (
    <Box display="grid" gridTemplateRows="1fr auto" sx={{ width: "100%", height: "100%" }}>
      <div
        ref={mapContainer}
      />
      <SpeedDisplay
        speed={speed}
        heartRate={heartRate}
        cadence={cadence}
        power={power}
        traveledDistance={simulator.traveledDistance}
        remainingDistance={simulator.remainingDistance}
        elapsedTime={simulator.elapsedTime}
        estimatedTime={throttledTime}
        userData={userData}
      />
    </Box>
  );
};

export default MapWithMovingMarker;