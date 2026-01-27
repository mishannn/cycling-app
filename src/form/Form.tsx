import { ChangeEvent, useState } from "react";
import { calculateGeoJSONLengthInMeters } from "../utils/geojson";
import { AVERAGE_SPEED_KMH } from "../utils/constants";
import { Feature, LineString } from "geojson";

interface FormProps {
  onStart: (demo: boolean, feature: Feature<LineString>) => void;
}

function getFeatureLengthForLabel(feature: Feature<LineString>): string {
  return `${(calculateGeoJSONLengthInMeters(feature) / 1000).toFixed(1)} км`;
}

function getFeatureTimeForLabel(feature: Feature<LineString>): string {
  return `${((calculateGeoJSONLengthInMeters(feature) / (AVERAGE_SPEED_KMH * 1000)) * 60).toFixed()} мин`;
}

export function Form({ onStart }: FormProps) {
  const [route, setRoute] = useState<Feature<LineString> | undefined>(undefined)
  const [reverse, setReverse] = useState<boolean>(false);

  function getFeatureByNameWithReversingIfNeeded(feature: Feature<LineString>): Feature<LineString> {
    if (reverse) {
      feature.geometry.coordinates.reverse();
    }

    return feature;
  }

  function onConnect() {
    if (!route) {
      alert("Route is required!");
      return;
    }

    const feature = getFeatureByNameWithReversingIfNeeded(route);
    onStart(false, feature);
  }

  function onDemo() {
    if (!route) {
      alert("Route is required!");
      return;
    }

    const feature = getFeatureByNameWithReversingIfNeeded(route);
    onStart(true, feature);
  }

  function onSelectFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    if (!file.name.endsWith('.json')) {
      alert('Please upload a valid .json file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const fileContents = e.target?.result
      if (typeof fileContents !== "string") {
        alert(`File content is not a string`)
        return
      }

      try {
        const json = JSON.parse(fileContents);
        setRoute(json);
      } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
        alert(`Error parse JSON: ${err.message}`)
      }
    };
    reader.onerror = () => {
      alert('Error reading file');
    };
    reader.readAsText(file);
  }

  return (
    <div className="form">
      {/* Selector for 'route' */}
      <div className="form-field">
        <label htmlFor="route">GeoJSON route:</label><br />
        <input type="file" accept=".json" onChange={onSelectFile} />
      </div>

      {/* Checkbox for 'reverse' */}
      <div className="form-field">
        <label htmlFor="reverse">
          <input
            type="checkbox"
            id="reverse"
            name="reverse"
            checked={reverse}
            onChange={(event) => setReverse(event.target.checked)}
            tabIndex={2}
          />
          Reverse
        </label>
      </div>

      {/* Buttons */}
      <div className="buttons">
        <button onClick={onConnect} tabIndex={3}>
          Connect
        </button>
        <button onClick={onDemo} tabIndex={4}>
          Demo
        </button>
      </div>

      {route && <div>Расстояние: {getFeatureLengthForLabel(route)}</div>}
      {route && <div>Ориентировочное время: {getFeatureTimeForLabel(route)}</div>}
    </div>
  );
}
