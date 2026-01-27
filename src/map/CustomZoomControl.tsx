import React, { useCallback } from "react";
import { useMap } from "react-leaflet";
import "./CustomZoomControl.css";

const CustomZoomControl = () => {
  const map = useMap();

  const zoomIn = useCallback(() => {
    map.zoomIn();
  }, [map]);

  const zoomOut = useCallback(() => {
    map.zoomOut();
  }, [map]);

  return (
    <div className="custom-zoom-control">
      <button tabIndex={0} onClick={zoomIn} aria-label="Zoom In">
        ➕
      </button>
      <button tabIndex={0} onClick={zoomOut} aria-label="Zoom Out">
        ➖
      </button>
    </div>
  );
};

export default CustomZoomControl;
