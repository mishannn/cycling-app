import React, { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Polyline, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import GeojsonSimulator from "../services/GeojsonSimulator";
import bikePng from "./bike.png";
import RotatedMarker from "./RotatedMarker";
import { KeepAwake } from "@capacitor-community/keep-awake";
import { Capacitor } from "@capacitor/core";
import { formatTime } from "../utils/time";
import CustomZoomControl from "./CustomZoomControl";
import {
  SHOW_ROUTE_LINE,
  TIME_UPDATE_INTERVAL_MS,
  UPDATE_INTERVAL_MS,
} from "../utils/constants";
import { Feature, LineString } from "geojson";

const bikeIcon = L.icon({
  iconUrl: bikePng,
  iconSize: [60, 60],
  iconAnchor: [30, 30],
});

const MapCenterUpdater: React.FC<{ position: [number, number] }> = ({
  position,
}) => {
  const map = useMap();

  useEffect(() => {
    if (Capacitor.getPlatform() === "web") {
      return;
    }
    KeepAwake.keepAwake();
    return () => {
      KeepAwake.allowSleep();
    };
  }, []);

  useEffect(() => {
    const mapContainer = document.querySelector(".leaflet-container");
    if (mapContainer) {
      mapContainer.removeAttribute("tabindex");
    }
  }, []);

  useEffect(() => {
    if (position) {
      map.setView(position, map.getZoom());
    }
  }, [position, map]);

  return null;
};

const MapWithMovingMarker: React.FC<{
  feature: Feature<LineString>;
  speed: number;
  heartRate: number;
}> = ({ feature, speed, heartRate }) => {
  const simulator = useMemo(() => new GeojsonSimulator(feature, 0), [feature]);
  const [position, setPosition] = useState<[number, number]>([
    feature.geometry.coordinates[0][1],
    feature.geometry.coordinates[0][0],
  ]);
  const [bearing, setBearing] = useState<number>(0);
  const [throttledTime, setThrottledTime] = useState<number>(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const newPosition = simulator.nextStep(UPDATE_INTERVAL_MS / 1000);
      if (newPosition) {
        setPosition([newPosition.lat, newPosition.lon]);
        setBearing(newPosition.bearing);
      } else {
        clearInterval(interval);
      }
    }, UPDATE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [simulator]);

  useEffect(() => {
    simulator.setSpeedKmh(speed);
  }, [simulator, speed]);

  useEffect(() => {
    const interval = setInterval(() => {
      setThrottledTime(simulator.getEstimatedTime());
    }, TIME_UPDATE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [simulator]);

  return (
    <div style={{ height: "100%", width: "100%" }}>
      <MapContainer
        center={position}
        zoom={18}
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {SHOW_ROUTE_LINE && (
          <Polyline
            positions={feature.geometry.coordinates.map((coord) => [
              coord[1],
              coord[0],
            ])}
            color="blue"
          />
        )}
        <RotatedMarker position={position} icon={bikeIcon} rotation={bearing} />
        <MapCenterUpdater position={position} />
        <CustomZoomControl />
      </MapContainer>
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
