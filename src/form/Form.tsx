import { ChangeEvent, useState } from "react";
import { calculateGeoJSONLengthInMeters } from "../utils/geojson";
import { DEMO_SPEED_KMH } from "../utils/constants";
import { Feature, LineString } from "geojson";

// Material UI imports
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Typography,
  Card,
  CardContent,
  Alert
} from "@mui/material";

interface FormProps {
  onStart: (demo: boolean, feature: Feature<LineString>) => void;
}

function getFeatureLengthForLabel(feature: Feature<LineString>): string {
  return `${(calculateGeoJSONLengthInMeters(feature) / 1000).toFixed(1)} km`;
}

function getFeatureTimeForLabel(feature: Feature<LineString>): string {
  return `${((calculateGeoJSONLengthInMeters(feature) / (DEMO_SPEED_KMH * 1000)) * 60).toFixed()} min`;
}

export function Form({ onStart }: FormProps) {
  const [route, setRoute] = useState<Feature<LineString> | undefined>(undefined)
  const [reverse, setReverse] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string | undefined>(undefined);

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

    setFileName(file.name);

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
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', p: 2 }}>
      <Card sx={{ minWidth: 300, maxWidth: 500, width: '100%' }}>
        <CardContent>
          <Typography variant="h5" component="h1" gutterBottom align="center">
            Cycling Route Setup
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
              <Button
                variant="outlined"
                component="label"
                fullWidth
              >
                {fileName ? `Selected: ${fileName}` : "Upload GeoJSON Route"}
                <input
                  type="file"
                  accept=".json"
                  hidden
                  onChange={onSelectFile}
                />
              </Button>
            </Box>
            
            <Box>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={reverse}
                    onChange={(event) => setReverse(event.target.checked)}
                  />
                }
                label="Reverse"
              />
            </Box>
            
            <Box>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 2 }}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={onConnect}
                  size="large"
                >
                  Connect
                </Button>
                <Button 
                  variant="outlined" 
                  color="primary" 
                  onClick={onDemo}
                  size="large"
                >
                  Demo
                </Button>
              </Box>
            </Box>
            
            {route && (
              <Box>
                <Alert severity="info">
                  <Typography variant="body2">
                    Distance: {getFeatureLengthForLabel(route)}
                  </Typography>
                  <Typography variant="body2">
                    Duration at {DEMO_SPEED_KMH} km/h: {getFeatureTimeForLabel(route)}
                  </Typography>
                </Alert>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
