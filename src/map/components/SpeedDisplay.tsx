import React from "react";
import { formatTime } from "../../utils/time";
import {
  Card,
  CardContent,
  Typography,
  Box,
} from "@mui/material";
import {
  Speed,
  Favorite,
  DirectionsBike,
  Power,
  Route,
  Schedule,
  AccessTime,
} from "@mui/icons-material";

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

const SpeedDisplay: React.FC<SpeedDisplayProps> = ({
  speed,
  heartRate,
  cadence,
  power,
  traveledDistance,
  remainingDistance,
  elapsedTime,
  estimatedTime,
}) => {
  return (
    <Box
      sx={{
        position: "fixed",
        right: 16,
        bottom: 16,
        zIndex: 1000000,
        minWidth: 280,
        maxWidth: 320,
      }}
    >
      <Card elevation={8}>
        <CardContent sx={{ pb: 2 }}>
          <Typography variant="h6" component="div" gutterBottom fontWeight="bold">
            Ride Metrics
          </Typography>
          
          <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
            <Box display="flex" alignItems="center" mb={1}>
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
            
            <Box display="flex" alignItems="center" mb={1}>
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
            
            <Box display="flex" alignItems="center" mb={1}>
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
            
            <Box display="flex" alignItems="center" mb={1}>
              <Power color="warning" sx={{ mr: 1, fontSize: 20 }} />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Power
                </Typography>
                <Typography variant="h6" fontWeight="medium">
                  {power.toFixed(0)} W
                </Typography>
              </Box>
            </Box>
            
            <Box display="flex" alignItems="center" mb={1}>
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
            
            <Box display="flex" alignItems="center" mb={1}>
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
            
            <Box display="flex" alignItems="center">
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
            
            <Box display="flex" alignItems="center">
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
        </CardContent>
      </Card>
    </Box>
  );
};

export default SpeedDisplay;
