import React from "react";
import { formatTime } from "../../utils/time";

interface SpeedDisplayProps {
  speed: number;
  heartRate: number;
  estimatedTime: number;
}

const SpeedDisplay: React.FC<SpeedDisplayProps> = ({ speed, heartRate, estimatedTime }) => {
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
      HR: {heartRate.toFixed()} bpm
      <br />
      Estimated time: {formatTime(estimatedTime)}
    </div>
  );
};

export default SpeedDisplay;