import React from "react";
import { formatTime } from "../../utils/time";

interface SpeedDisplayProps {
  speed: number;
  heartRate: number;
  cadence: number;
  power: number;
  traveledDistance: number;
  remainingDistance: number;
  elapsedTime: number;
  estimatedTime: number;
}

const SpeedDisplay: React.FC<SpeedDisplayProps> = ({ speed, heartRate, cadence, power, traveledDistance, remainingDistance, elapsedTime, estimatedTime }) => {
  return (
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
      HR: {heartRate.toFixed()} BPM
      <br />
      Cadence: {cadence.toFixed()} RPM
      <br />
      Power: {power.toFixed()} W
      <br />
      Traveled distance: {(traveledDistance / 1000).toFixed(2)} km
      <br />
      Remaining distance: {(remainingDistance / 1000).toFixed(2)} km
      <br />
      Elapsed time: {formatTime(elapsedTime)}
      <br />
      Estimated time: {formatTime(estimatedTime)}
    </div>
  );
};

export default SpeedDisplay;