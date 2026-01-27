import L from "leaflet";
import { useMap } from "react-leaflet";
import React from "react";

interface RotatedMarkerProps {
  position: [number, number];
  rotation?: number;
  rotationOrigin?: string;
  icon?: L.Icon;
}

const LeafletMarker = L.Marker.extend({
  onAdd(map: L.Map) {
    L.Marker.prototype.onAdd.call(this, map);
    if (this._icon) {
      this._icon.removeAttribute("tabIndex");
    }
  },
  _setPos(pos: L.Point) {
    (
      L.Marker.prototype as unknown as {
        _setPos(pos: L.Point): void;
      }
    )._setPos.call(this, pos);
    this._setRotation(this.options.rotation);
  },
  _setRotation(rotation: number) {
    if (typeof rotation === "number" && this._icon) {
      this._icon.style[(L.DomUtil.TRANSFORM + "Origin") as unknown as string] =
        this.options.rotationOrigin || "center";
      const transform =
        this._icon.style[L.DomUtil.TRANSFORM] + ` rotate(${rotation}deg)`;
      this._icon.style[L.DomUtil.TRANSFORM] = transform;
    }
  },
});

interface CreateRotatedMarkerOptions extends L.MarkerOptions {
  rotation?: number;
  rotationOrigin?: string;
  icon?: L.Icon;
}

const createRotatedMarker = (
  position: L.LatLngExpression,
  options?: CreateRotatedMarkerOptions,
) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new (LeafletMarker as any)(position, options);
};

const RotatedMarker: React.FC<RotatedMarkerProps> = ({
  position,
  rotation,
  rotationOrigin,
  icon,
}) => {
  const map = useMap();

  React.useEffect(() => {
    const marker = createRotatedMarker(position, {
      rotation,
      rotationOrigin,
      icon,
    });

    marker.addTo(map);

    return () => {
      map.removeLayer(marker);
    };
  }, [icon, map, position, rotation, rotationOrigin]);

  return null;
};

export default RotatedMarker;
