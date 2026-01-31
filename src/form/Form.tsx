import { ChangeEvent, useState } from "react";
import { calculateGeoJSONLengthInMeters } from "../utils/geojson";
import { DEMO_SPEED_KMH } from "../utils/constants";
import { Feature, LineString } from "geojson";

// Material UI imports
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Card,
  CardContent,
  Alert
} from "@mui/material";
import { UserData, UserSex } from "src/map/types/userData";
import { useLocalStorageState } from "ahooks";

interface FormProps {
  onStart: (demo: boolean, feature: Feature<LineString>, userData: UserData) => void;
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
  const [sex, setSex] = useLocalStorageState<UserSex>("userSex", { defaultValue: 'male' });
  const [age, setAge] = useLocalStorageState<number>("userAge", { defaultValue: 30 });
  const [height, setHeight] = useLocalStorageState<number>("userHeight", { defaultValue: 170 });
  const [weight, setWeight] = useLocalStorageState<number>("userWeight", { defaultValue: 70 });

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
    onStart(false, feature, { sex, age, height, weight });
  }

  function onDemo() {
    if (!route) {
      alert("Route is required!");
      return;
    }

    const feature = getFeatureByNameWithReversingIfNeeded(route);
    onStart(true, feature, { sex, age, height, weight });
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
              <FormControl fullWidth>
                <InputLabel id="sex-label">Sex</InputLabel>
                <Select
                  labelId="sex-label"
                  value={sex}
                  label="Sex"
                  onChange={(event) => setSex(event.target.value as UserSex)}
                >
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box>
              <TextField
                fullWidth
                type="number"
                label="Age (years)"
                value={age}
                onChange={(event) => setAge(Number(event.target.value))}
                InputProps={{ inputProps: { min: 1, max: 120 } }}
              />
            </Box>

            <Box>
              <TextField
                fullWidth
                type="number"
                label="Height (cm)"
                value={height}
                onChange={(event) => setHeight(Number(event.target.value))}
                InputProps={{ inputProps: { min: 50, max: 250 } }}
              />
            </Box>

            <Box>
              <TextField
                fullWidth
                type="number"
                label="Weight (kg)"
                value={weight}
                onChange={(event) => setWeight(Number(event.target.value))}
                InputProps={{ inputProps: { min: 20, max: 200 } }}
              />
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
                  onClick={() => onConnect()}
                  size="large"
                >
                  Connect
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => onDemo()}
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
