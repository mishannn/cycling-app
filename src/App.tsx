import React, { useState } from "react";
import "./App.css";
import MapWithMovingMarker from "./map/Map";
import { Form } from "./form/Form";
import { connectToBikeAndReadData } from "./ble/ble";
import { AVERAGE_SPEED_KMH } from "./utils/constants";
import { Feature, LineString } from "geojson";

// Define types for our data
interface BikeData {
  speed?: number;
  heartRate?: number;
  cadence?: number;
  distance?: number;
  power?: number;
  [key: string]: number | undefined;
}

function App() {
  const [running, setRunning] = useState<boolean>(false);
  const [feature, setFeature] = useState<Feature<LineString> | undefined>(undefined);
  const [speed, setSpeed] = useState<number>(0);
  const [heartRate, setHeartRate] = useState<number>(0);

  async function onStart(demo: boolean, feature: Feature<LineString>) {
    try {
      setFeature(feature);

      if (demo) {
        setSpeed(AVERAGE_SPEED_KMH);
      } else {
        await connectToBikeAndReadData((data: BikeData) => {
          if (data.speed !== undefined) {
            setSpeed(data.speed);
          }
          if (data.heartRate !== undefined) {
            setHeartRate(data.heartRate);
          }
        });
      }

      setRunning(true);
    } catch (e: unknown) {
      if (e instanceof Error) {
        alert(`Can't start: ${e.message}`);
      } else {
        alert(`Can't start: Unknown error`);
      }
    }
  }

  function renderMap() {
    if (!feature) {
      return (
        <div style={{ height: "100%", width: "100%" }}>
          <div>Loading map...</div>
        </div>
      );
    }

    return (
      <MapWithMovingMarker
        feature={feature}
        speed={speed}
        heartRate={heartRate}
      />
    );
  }

  return (
    <div className="App" style={{ height: "100vh", width: "100vw" }}>
      {running ? renderMap() : <Form onStart={onStart} />}
    </div>
  );
}

export default App;
