import Geolocation from '@react-native-community/geolocation';
import { Coordinate } from '../types/walk';
import { LAST_LOCATION_KEY, storageService } from './storageService';

class LocationService {
  private watchId: number | null = null;

  async requestPermissions(): Promise<boolean> {
    try {
      const granted = await new Promise<boolean>((resolve) => {
        Geolocation.requestAuthorization(
          () => resolve(true),
          (error) => {
            console.error('Location permission error:', error);
            resolve(false);
          }
        );
      });
      return granted;
    } catch (error) {
      console.error('Error requesting location permissions:', error);
      return false;
    }
  }

  getCurrentLocation(): Promise<Coordinate> {
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error getting current location:', error);
          reject(error);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    });
  }

  startTracking(onLocationUpdate: (coordinate: Coordinate) => void): void {
    this.watchId = Geolocation.watchPosition(
      (position) => {
        onLocationUpdate({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        console.error('Error watching location:', error);
      },
      {
        enableHighAccuracy: true,
        distanceFilter: 1,
        interval: 1000,
        fastestInterval: 250,
      }
    );
  }
  async getLastLocation(): Promise<Coordinate | null> {
    try {
      const locationData = await storageService.loadRawData(LAST_LOCATION_KEY);
      if (locationData) {
        return JSON.parse(locationData);
      }
      return null;
    } catch (error) {
      console.error('Error parsing last location:', error);
      return null;
    }
  }
  storeLocation(coordinate: Coordinate): void {
    storageService.storeData(LAST_LOCATION_KEY, JSON.stringify(coordinate));
  }
  deleteLocation(): void {
    storageService.deleteData(LAST_LOCATION_KEY);
  }

  stopTracking(): void {
    if (this.watchId !== null) {
      Geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }
}

export const locationService = new LocationService(); 