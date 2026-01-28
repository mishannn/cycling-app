import { Feature } from "geojson";

export interface Position {
  lat: number;
  lon: number;
  bearing: number;
}

export default class GeojsonSimulator {
  private coordinates: number[][];
  private currentIndex: number;
  private progress: number;
  private speed!: number;

  constructor(feature: Feature, speedKmh: number = 10) {
    if (feature.type !== "Feature" || feature.geometry.type !== "LineString") {
      throw new Error(
        "Переданный GeoJSON должен быть Feature с геометрией LineString",
      );
    }
    this.coordinates = feature.geometry.coordinates;
    this.setSpeedKmh(speedKmh);
    this.currentIndex = 0;
    this.progress = 0; // Прогресс между точками (0 - 1)
  }

  setSpeedKmh(speedKmh: number) {
    this.speed = (speedKmh * 1000) / 3600; // Переводим в м/с
  }

  getSpeedKmh(): number {
    return (this.speed * 3600) / 1000; // Переводим в м/с
  }

  getDistance(coord1: number[], coord2: number[]): number {
    const [lon1, lat1] = coord1;
    const [lon2, lat2] = coord2;
    const R = 6371000; // Радиус Земли в метрах
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  getBearing(coord1: number[], coord2: number[]): number {
    const [lon1, lat1] = coord1.map((deg: number) => (deg * Math.PI) / 180);
    const [lon2, lat2] = coord2.map((deg: number) => (deg * Math.PI) / 180);
    const dLon = lon2 - lon1;
    const y = Math.sin(dLon) * Math.cos(lat2);
    const x =
      Math.cos(lat1) * Math.sin(lat2) -
      Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
    return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
  }

  nextStep(deltaTime: number): Position | null {
    if (this.currentIndex >= this.coordinates.length - 1) return null; // Достигли конца

    const start = this.coordinates[this.currentIndex];
    const end = this.coordinates[this.currentIndex + 1];
    const distance = this.getDistance(start, end);
    const moveDist = this.speed * deltaTime;

    this.progress += moveDist / distance;
    if (this.progress >= 1) {
      this.progress = 0;
      this.currentIndex++;
      return this.nextStep(deltaTime);
    }

    const lat = start[1] + (end[1] - start[1]) * this.progress;
    const lon = start[0] + (end[0] - start[0]) * this.progress;
    const bearing = this.getBearing(start, end);

    return { lat, lon, bearing };
  }

  getEstimatedTime(): number {
    if (this.currentIndex >= this.coordinates.length - 1) return 0; // Маршрут завершен

    if (this.speed === 0) return Infinity;

    let remainingDistance = 0;

    // Расчет оставшегося расстояния
    for (let i = this.currentIndex; i < this.coordinates.length - 1; i++) {
      const start = this.coordinates[i];
      const end = this.coordinates[i + 1];
      const segmentDistance = this.getDistance(start, end);

      if (i === this.currentIndex) {
        // Учитываем прогресс на текущем сегменте
        remainingDistance += segmentDistance * (1 - this.progress);
      } else {
        remainingDistance += segmentDistance;
      }
    }

    // Время = Расстояние / Скорость
    return remainingDistance / this.speed;
  }
}
