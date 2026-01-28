import React from "react";
import maplibregl from "maplibre-gl";
import { Feature, LineString } from "geojson";
import { SavedTrip, SavedTripPoint } from "../types/trip";
import { startPreviousTripAnimation } from "./helpers";
import bikeIcon from '../bike.png';
import bikeBWIcon from '../bike_bw.png';
import { UPDATE_INTERVAL_MS } from "../../utils/constants";
import GeojsonSimulator from "@/services/GeojsonSimulator";

// Load previous trip data from localStorage
export const loadPreviousTripData = (
  routeId: string,
  setPreviousTrip: React.Dispatch<React.SetStateAction<SavedTrip | null>>
) => {
  try {
    const savedTrips = localStorage.getItem('cyclingAppTrips');
    if (savedTrips) {
      const trips: SavedTrip[] = JSON.parse(savedTrips);
      const prevTrip = trips.find(trip => trip.routeId === routeId);
      if (prevTrip) {
        setPreviousTrip(prevTrip);
      }
    }
  } catch (error) {
    console.error('Error loading previous trip:', error);
  }
};

// Initialize the map with all layers and markers
export const initializeMap = (
  mapContainer: HTMLDivElement,
  feature: Feature<LineString>,
  previousTrip: SavedTrip | null,
  setPreviousTripMarkerRef: (marker: maplibregl.Marker | null) => void,
  setPreviousTripIntervalRef: (interval: ReturnType<typeof setInterval> | null) => void
): { map: maplibregl.Map; marker: maplibregl.Marker } => {
  const center = {
    lat: feature.geometry.coordinates[0][1],
    lng: feature.geometry.coordinates[0][0],
  };

  const map = new maplibregl.Map({
    container: mapContainer,
    style: "https://tiles.openfreemap.org/styles/liberty",
    center: center,
    zoom: 18,
    pitch: 0,
    bearing: 0,
    canvasContextAttributes: { antialias: true },
    attributionControl: false,
  });

  // Create main bike marker
  const el = document.createElement('div');
  el.className = 'marker';
  el.style.backgroundImage = `url(${bikeIcon})`;
  el.style.backgroundSize = 'cover';
  el.style.width = `60px`;
  el.style.height = `60px`;

  const marker = new maplibregl.Marker({ element: el });
  marker.setLngLat(center);
  marker.setRotationAlignment("map");

  map.on("load", () => {
    map.addControl(new maplibregl.NavigationControl({
      showZoom: true,
      visualizePitch: false,
      visualizeRoll: false,
      showCompass: false,
    }));

    map.addControl(new maplibregl.AttributionControl(), "bottom-left");

    map.addLayer({
      id: "3d-buildings",
      source: "openmaptiles",
      "source-layer": "building",
      type: "fill-extrusion",
      minzoom: 15,
      paint: {
        "fill-extrusion-color": "#aaa",
        "fill-extrusion-height": [
          "interpolate",
          ["linear"],
          ["zoom"],
          15,
          0,
          16,
          ["get", "height"]
        ],
        "fill-extrusion-base": [
          "interpolate",
          ["linear"],
          ["zoom"],
          15,
          0,
          16,
          ["get", "min_height"]
        ],
        "fill-extrusion-opacity": 0.8,
      },
    });

    // Add main bike marker to map
    marker.addTo(map);

    // Previous trip marker (if available)
    if (previousTrip && previousTrip.points.length > 0) {
      const prevEl = document.createElement('div');
      prevEl.className = 'previous-trip-marker';
      prevEl.style.backgroundImage = `url(${bikeBWIcon})`;
      prevEl.style.backgroundSize = 'cover';
      prevEl.style.width = `60px`;
      prevEl.style.height = `60px`;

      const prevMarker = new maplibregl.Marker({ element: prevEl });
      prevMarker.setLngLat([previousTrip.points[0].lon, previousTrip.points[0].lat]);
      prevMarker.setRotationAlignment("map");
      prevMarker.setRotation(previousTrip.points[0].bearing);
      prevMarker.addTo(map);
      setPreviousTripMarkerRef(prevMarker);
      
      // Start animating the previous trip marker
      const interval = startPreviousTripAnimation(
        map,
        previousTrip,
        prevMarker
      );
      setPreviousTripIntervalRef(interval);
    }
  });

  return { map, marker };
};

// Update simulator speed
export const updateSimulatorSpeed = (
  simulator: GeojsonSimulator,
  speed: number
) => {
  simulator.speedKmh = speed;
};

// Start position tracking and trip recording
export const startPositionTracking = (
  simulator: GeojsonSimulator,
  routeId: string,
  tripRecordingRef: React.MutableRefObject<SavedTripPoint[]>,
  tripStartTimeRef: React.MutableRefObject<number>,
  setPosition: React.Dispatch<React.SetStateAction<{ lon: number; lat: number; bearing: number }>>
) => {
  const interval = setInterval(() => {
    const newPosition = simulator.nextStep(UPDATE_INTERVAL_MS / 1000);
    if (newPosition) {
      setPosition(newPosition);
      
      // Record current position for trip saving
      tripRecordingRef.current.push({
        lat: newPosition.lat,
        lon: newPosition.lon,
        bearing: newPosition.bearing,
        timestamp: Date.now()
      });
    } else {
      // Trip completed - save to localStorage
      clearInterval(interval);
      
      const endTime = Date.now();
      const totalTime = (endTime - tripStartTimeRef.current) / 1000; // in seconds
      
      const newTrip: SavedTrip = {
        routeId,
        points: tripRecordingRef.current,
        startTime: tripStartTimeRef.current,
        endTime,
        totalTime
      };
      
      // Save to localStorage
      try {
        const savedTrips = localStorage.getItem('cyclingAppTrips');
        let trips: SavedTrip[] = [];
        
        if (savedTrips) {
          trips = JSON.parse(savedTrips);
        }
        
        // Remove any existing trip for this route
        trips = trips.filter(trip => trip.routeId !== routeId);
        
        // Add the new trip
        trips.push(newTrip);
        
        // Save back to localStorage (keep only the last 10 trips to prevent storage bloat)
        localStorage.setItem('cyclingAppTrips', JSON.stringify(trips.slice(-10)));
      } catch (error) {
        console.error('Error saving trip:', error);
      }
    }
  }, UPDATE_INTERVAL_MS);

  return interval;
};

// Update marker position
export const updateMarkerPosition = (
  marker: maplibregl.Marker | null,
  position: { lon: number; lat: number; bearing: number }
) => {
  marker?.setLngLat([position.lon, position.lat]);
  marker?.setRotation(position.bearing);
};

// Ease map to position
export const easeMapToPosition = (
  map: maplibregl.Map | null,
  position: { lon: number; lat: number; bearing: number }
) => {
  map?.easeTo({
    center: [position.lon, position.lat],
    bearing: position.bearing,
    animate: true,
    duration: 1000,
    easing: (val: number) => val,
  });
};