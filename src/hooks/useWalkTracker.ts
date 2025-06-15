import { useState, useEffect, useCallback, useRef } from 'react';
import { Walk, Coordinate, WalkState } from '../types/walk';
import { locationService } from '../services/locationService';
import useWalkList from './useWalkList';
import { check } from 'react-native-permissions';
import { PERMISSIONS } from 'react-native-permissions';
import { RESULTS } from 'react-native-permissions';
import { Platform } from 'react-native';

const initialState: WalkState = {
  isTracking: false,
  currentWalk: null,
  currentLocation: null,
};

export const useWalkTracker = () => {
  const [state, setState] = useState<WalkState>(initialState);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const { addWalk } = useWalkList();
  const startTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number>(0);
  const [showPermissionModal, setShowPermissionModal] = useState<boolean>(false);

  const requestLocationPermission = async () => {
    const granted = await locationService.requestPermissions();
    const hasPermission = await hasLocationPermission();
    setShowPermissionModal(!hasPermission)
    if (granted && hasPermission) {
      try {
        const location = await locationService.getCurrentLocation();
        setState((prev) => ({ ...prev, currentLocation: location }));
       
        locationService.startTracking((coordinate: Coordinate) => {
          setState((prev) => ({
            ...prev,
            currentLocation: coordinate,
          }));
        });
      } catch (error) {
        console.error('Error getting initial location:', hasPermission);
        setShowPermissionModal(true)
      }
    }
  };

  const hasLocationPermission = async () => {
    const permission =
      Platform.OS === 'ios'
        ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
        : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
    const result = await check(permission);
    return (result == RESULTS.GRANTED);
  };
  useEffect(() => {
    requestLocationPermission();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const updateTimer = useCallback(() => {
    if (startTimeRef.current) {
      setElapsedTime(Date.now() - startTimeRef.current);
      animationFrameRef.current = requestAnimationFrame(updateTimer);
    }
  }, []);

  const startWalk = useCallback(() => {
    const startTime = Date.now();
    startTimeRef.current = startTime;
    
    const newWalk: Walk = {
      id: startTime.toString(),
      startTime,
      endTime: 0,
      duration: 0,
      coordinates: [],
    };

    setState((prev) => ({
      ...prev,
      isTracking: true,
      currentWalk: newWalk,
    }));

    // Start timer updates using requestAnimationFrame
    animationFrameRef.current = requestAnimationFrame(updateTimer);

    locationService.startTracking((coordinate: Coordinate) => {
      setState((prev) => {
        if (!prev.currentWalk) return prev;
        return {
          ...prev,
          currentLocation: coordinate,
          currentWalk: {
            ...prev.currentWalk,
            coordinates: [...prev.currentWalk.coordinates, coordinate],
          },
        };
      });
    });
  }, [updateTimer]);

  const stopWalk = async (save: boolean = true) => {
    // Stop timer updates
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = 0;
    }

    const endTime = Date.now();
    locationService.stopTracking();
    
    if (state.currentWalk) {
      const completedWalk = {
        ...state.currentWalk,
        endTime,
        duration: endTime - state.currentWalk.startTime,
      };
      if (save) {
        await addWalk(completedWalk);
      }
    }
    
    setState(initialState);
    setElapsedTime(0);
    startTimeRef.current = 0;
  };

  return {
    ...state,
    elapsedTime,
    startWalk,
    hasLocationPermission,
    stopWalk,
    showPermissionModal,
    setShowPermissionModal,
  };
}; 