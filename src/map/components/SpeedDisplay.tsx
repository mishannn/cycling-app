import React from "react";
import { formatTime } from "../../utils/time";
import {
  Typography,
  Box,
} from "@mui/material";
import {
  Speed,
  Favorite,
  DirectionsBike,
  // Power,
  Route,
  Schedule,
  AccessTime,
  Whatshot
} from "@mui/icons-material";
import { calculateCaloriesPerMinute } from "../../utils/calories";
import { UserData } from "../types/userData";

interface SpeedDisplayProps {
  speed: number;
  heartRate: number;
  cadence: number;
  power: number;
  traveledDistance: number;
  remainingDistance: number;
  elapsedTime: number;
  estimatedTime: number;
  userData?: UserData;
}

const SpeedDisplay: React.FC<SpeedDisplayProps> = ({
  speed,
  heartRate,
  cadence,
  // power,
  traveledDistance,
  remainingDistance,
  elapsedTime,
  estimatedTime,
  userData,
}) => {
  const calories = userData && heartRate
    ? calculateCaloriesPerMinute({
      gender: userData.sex,
      age: userData.age,
      height: userData.height,
      weight: userData.weight,
      heartRate: heartRate
    })
    : 0;

  return (
    <Box sx={{ p: 2, minWidth: 280 }}>
      <Typography variant="h6" component="div" gutterBottom fontWeight="bold">
        Ride Metrics
      </Typography>

      <Box display="flex" flexWrap="wrap" flexBasis="100%" gap={2}>
        <Box display="flex" alignItems="center" flexGrow={1} sx={{ minWidth: 120 }}>
          <Speed color="primary" sx={{ mr: 1, fontSize: 20 }} />
          <Box>
            <Typography variant="body2" color="text.secondary">
              Speed
            </Typography>
            <Typography variant="h6" fontWeight="medium">
              {speed.toFixed(0)} km/h
            </Typography>
          </Box>
        </Box>

        <Box display="flex" alignItems="center" flexGrow={1} sx={{ minWidth: 120 }}>
          <Favorite color="error" sx={{ mr: 1, fontSize: 20 }} />
          <Box>
            <Typography variant="body2" color="text.secondary">
              Heart Rate
            </Typography>
            <Typography variant="h6" fontWeight="medium">
              {heartRate.toFixed(0)} BPM
            </Typography>
          </Box>
        </Box>

        <Box display="flex" alignItems="center" flexGrow={1} sx={{ minWidth: 120 }}>
          <DirectionsBike color="secondary" sx={{ mr: 1, fontSize: 20 }} />
          <Box>
            <Typography variant="body2" color="text.secondary">
              Cadence
            </Typography>
            <Typography variant="h6" fontWeight="medium">
              {cadence.toFixed(0)} RPM
            </Typography>
          </Box>
        </Box>

        <Box display="flex" alignItems="center" flexGrow={1} sx={{ minWidth: 120 }}>
          <Whatshot color="warning" sx={{ mr: 1, fontSize: 20 }} />
          <Box>
            <Typography variant="body2" color="text.secondary">
              Calories
            </Typography>
            <Typography variant="h6" fontWeight="medium">
              {calories.toFixed(0)} cal/m
            </Typography>
          </Box>
        </Box>

        {/* <Box display="flex" alignItems="center" sx={{ minWidth: 120 }}>
          <Power color="warning" sx={{ mr: 1, fontSize: 20 }} />
          <Box>
            <Typography variant="body2" color="text.secondary">
              Power
            </Typography>
            <Typography variant="h6" fontWeight="medium">
              {power.toFixed(0)} W
            </Typography>
          </Box>
        </Box> */}

        <Box display="flex" alignItems="center" flexGrow={1} sx={{ minWidth: 120 }}>
          <Route color="success" sx={{ mr: 1, fontSize: 20 }} />
          <Box>
            <Typography variant="body2" color="text.secondary">
              Traveled
            </Typography>
            <Typography variant="h6" fontWeight="medium">
              {(traveledDistance / 1000).toFixed(2)} km
            </Typography>
          </Box>
        </Box>

        <Box display="flex" alignItems="center" flexGrow={1} sx={{ minWidth: 120 }}>
          <Route color="info" sx={{ mr: 1, fontSize: 20 }} />
          <Box>
            <Typography variant="body2" color="text.secondary">
              Remaining
            </Typography>
            <Typography variant="h6" fontWeight="medium">
              {(remainingDistance / 1000).toFixed(2)} km
            </Typography>
          </Box>
        </Box>

        <Box display="flex" alignItems="center" flexGrow={1} sx={{ minWidth: 120 }}>
          <AccessTime color="primary" sx={{ mr: 1, fontSize: 20 }} />
          <Box>
            <Typography variant="body2" color="text.secondary">
              Elapsed
            </Typography>
            <Typography variant="h6" fontWeight="medium">
              {formatTime(elapsedTime)}
            </Typography>
          </Box>
        </Box>

        <Box display="flex" alignItems="center" flexGrow={1} sx={{ minWidth: 120 }}>
          <Schedule color="secondary" sx={{ mr: 1, fontSize: 20 }} />
          <Box>
            <Typography variant="body2" color="text.secondary">
              Estimated
            </Typography>
            <Typography variant="h6" fontWeight="medium">
              {formatTime(estimatedTime)}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default SpeedDisplay;
