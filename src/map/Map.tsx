import React, { useEffect, useMemo, useRef, useState } from "react";
import GeojsonSimulator, { Position } from "../services/GeojsonSimulator";
import { formatTime } from "../utils/time";
import {
  // SHOW_ROUTE_LINE,
  TIME_UPDATE_INTERVAL_MS,
  UPDATE_INTERVAL_MS,
} from "../utils/constants";
import { Feature, LineString } from "geojson";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import bikeIcon from './bike.png'
import { useThrottle } from "ahooks";

const MapWithMovingMarker: React.FC<{
  feature: Feature<LineString>;
  speed: number;
  heartRate: number;
}> = ({ feature, speed, heartRate }) => {
  const simulator = useMemo(() => new GeojsonSimulator(feature, 0), [feature]);

  // Initialize map

  const mapRef = useRef<maplibregl.Map>(null);
  const markerRef = useRef<maplibregl.Marker>(null);
  const mapContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainer.current) {
      const msg = "Map container is not ready"
      console.error(msg)
      alert(msg)

      return
    }

    const center = {
      lat: feature.geometry.coordinates[0][1],
      lng: feature.geometry.coordinates[0][0],
    }

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://tiles.openfreemap.org/styles/liberty",
      center: center,
      zoom: 18,
      pitch: 0,
      bearing: 0,
      canvasContextAttributes: { antialias: true },
      attributionControl: false,
    });

    map.on("load", () => {
      map.addControl(new maplibregl.NavigationControl({
        showZoom: true,
        visualizePitch: false,
        visualizeRoll: false,
        showCompass: false,
      }));

      map.addControl(new maplibregl.AttributionControl(), "bottom-left")

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

      const el = document.createElement('div');
      el.className = 'marker';
      el.style.backgroundImage =
        `url(${bikeIcon})`;
      el.style.backgroundSize = 'cover'
      el.style.width = `60px`;
      el.style.height = `60px`;

      // add marker to map
      const marker = new maplibregl.Marker({ element: el })
      marker.setLngLat(center);
      marker.setRotationAlignment("map")
      marker.addTo(map)

      markerRef.current = marker
    });

    mapRef.current = map

    return () => {
      mapRef.current = null
      map.remove()
    };
  }, [feature]);

  // Update speed

  useEffect(() => {
    simulator.setSpeedKmh(speed);
  }, [simulator, speed]);

  // Watch position

  const [position, setPosition] = useState<Position>({
    lon: feature.geometry.coordinates[0][0],
    lat: feature.geometry.coordinates[0][1],
    bearing: 0
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const newPosition = simulator.nextStep(UPDATE_INTERVAL_MS / 1000);
      if (newPosition) {
        setPosition(newPosition);
      } else {
        clearInterval(interval);
      }
    }, UPDATE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [simulator]);

  useEffect(() => {
    markerRef.current?.setLngLat(position)
    markerRef.current?.setRotation(position.bearing)
  }, [position])

  const throttledPosition = useThrottle(position, { wait: 1000 })
  useEffect(() => {
    mapRef.current?.easeTo({
      center: throttledPosition,
      bearing: throttledPosition.bearing,
      animate: true,
      duration: 1000,
      easing: (val) => val,
    })
  }, [throttledPosition])

  // Update estimate time

  const throttledTime = useThrottle(simulator.getEstimatedTime(), { wait: TIME_UPDATE_INTERVAL_MS });

  return (
    <div style={{ height: "100%", width: "100%" }}>
      <div
        ref={mapContainer}
        style={{ width: "100%", height: "100vh" }}
      />
      <div
        style={{
          position: "fixed",
          right: 0,
          bottom: 0,
          zIndex: 1000000,
          background: "white",
          padding: "8px",
          fontFamily: "monospace",
        }}
      >
        Speed: {speed.toFixed()} km/h
        <br />
        HR: {heartRate.toFixed()} bpm
        <br />
        Estimated time: {formatTime(throttledTime)}
      </div>
    </div>
  );
};

export default MapWithMovingMarker;
