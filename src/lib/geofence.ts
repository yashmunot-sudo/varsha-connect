import { PLANT_GEOFENCE } from './constants';

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

// Haversine formula
export function getDistanceFromPlant(lat: number, lng: number): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = toRadians(lat - PLANT_GEOFENCE.lat);
  const dLng = toRadians(lng - PLANT_GEOFENCE.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(PLANT_GEOFENCE.lat)) *
      Math.cos(toRadians(lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function isInsideGeofence(lat: number, lng: number): boolean {
  return getDistanceFromPlant(lat, lng) <= PLANT_GEOFENCE.radiusMeters;
}

export function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported'));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    });
  });
}
