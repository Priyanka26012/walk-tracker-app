export interface Coordinate {
  latitude: number;
  longitude: number;
}

export interface Walk {
  id: string;
  startTime: number;
  endTime: number;
  duration: number;
  coordinates: Coordinate[];
  distance?: number;
}

export interface WalkState {
  isTracking: boolean;
  currentWalk: Walk | null;
  currentLocation: Coordinate | null;
} 