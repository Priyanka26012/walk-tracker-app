import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  AppState,
  Alert,
} from 'react-native';
import MapView, { Region } from 'react-native-maps';
import { useWalkTracker } from '../hooks/useWalkTracker';
import { HomeScreenProps } from '../types/navigation';
import { formatDuration } from '../utils/common-functions';
import { locationService } from '../services/locationService';
import { Coordinate } from '../types/walk';
import CustomMapView from '../components/MapView';
import LocationPermissionPopup from '../components/PermissionPopup';

const INITIAL_REGION = {
  latitude: 28.7041,
  longitude: 77.1025,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

export const HomeScreen = ({ navigation }: HomeScreenProps) => {
  const mapRef = useRef<MapView>(null);
  const [lastKnownLocation, setLastKnownLocation] = useState<Coordinate | null>(null);
  const [initialMapRegion, setInitialMapRegion] = useState<Region>(INITIAL_REGION);

  const {
    isTracking,
    currentWalk,
    currentLocation,
    startWalk,
    stopWalk,
    showPermissionModal,
    setShowPermissionModal,
    elapsedTime,
  } = useWalkTracker();
  // Load initial region from storage
  useEffect(() => {
    const loadInitialRegion = async () => {
      try {
        const savedLocation = await locationService.getLastLocation();
        if (savedLocation && typeof savedLocation === 'object' && 'latitude' in savedLocation && 'longitude' in savedLocation) {
          const location = savedLocation as Coordinate;
          setInitialMapRegion({
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.001,
            longitudeDelta: 0.001,
          });
        }
      } catch (error) {
        console.error('Error loading initial region:', error);
      }
    };
    loadInitialRegion();
    // Save location when component unmounts or user navigates away
    return () => {
      if (currentLocation) {
        locationService.storeLocation(currentLocation);
      }
    };
  }, [currentLocation]);

  // Save location when app goes to background
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'background' && currentLocation) {
        locationService.storeLocation(currentLocation);
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      subscription.remove();
    };
  }, [currentLocation]);

  useEffect(() => {
    if (currentLocation) {
      setLastKnownLocation(currentLocation);
      if (isTracking && mapRef.current) {
        mapRef.current.animateToRegion({
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          latitudeDelta: 0.001,
          longitudeDelta: 0.001,
        }, 500);
      }
    }
  }, [currentLocation, isTracking]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', () => {
      if (isTracking) {
        stopWalk();
      }
    });
    return unsubscribe;
  }, [navigation, isTracking, stopWalk]);



  const handleStartStop = () => {
    if (isTracking) {
      // Check if walk should be saved
      const noMovement = !currentWalk || !currentWalk.coordinates || currentWalk.coordinates.length <= 1;
      if (elapsedTime === 0 || noMovement) {
        Alert.alert(
          'Walk Not Saved',
          'To save the walk you need to move.',
          [{ text: 'OK' }]
        );
        stopWalk(false);
        return;
      }
      stopWalk();
    } else {
      startWalk();
    }
  };


  return (
    <View style={styles.container}>
      <CustomMapView
        style={styles.map}
        initialRegion={initialMapRegion}
        showsUserLocation={false}
        showsMyLocationButton
        followsUserLocation={isTracking}
        showsCompass
        showsScale
        showsBuildings
        showsIndoorLevelPicker
        moveOnMarkerPress={false}
        maxZoomLevel={20}
        minZoomLevel={3}
        zoomEnabled={true}
        zoomControlEnabled={true}
        currentCords={currentWalk?.coordinates || []}
        currentLocation={currentLocation || { latitude: lastKnownLocation?.latitude || 0, longitude: lastKnownLocation?.longitude || 0 }}
      />
      <View style={styles.controls}>
        {isTracking && currentWalk && (
          <View style={styles.timerContainer}>
            <Text style={styles.timer}>
              {formatDuration(elapsedTime)}
            </Text>
          </View>
        )}
        <TouchableOpacity
          style={[styles.button, isTracking ? styles.stopButton : styles.startButton]}
          onPress={handleStartStop}
        >
          <Text style={styles.buttonText}>
            {isTracking ? 'Stop Walk' : 'Start Walk'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.savedWalksButton, isTracking && styles.savedWalksButtonDisabled]}
          onPress={() => navigation.navigate('SavedWalks')}
          disabled={isTracking}
        >
          <Text style={[styles.savedWalksButtonText, isTracking && styles.savedWalksButtonTextDisabled]}>View Saved Walks</Text>
        </TouchableOpacity>
      </View>
      <LocationPermissionPopup visible={showPermissionModal} onClose={() => setShowPermissionModal(false)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  controls: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  button: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  startButton: {
    backgroundColor: '#4CAF50',
  },
  stopButton: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  timerContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 8,
    borderRadius: 20,
    marginBottom: 20,
  },
  timer: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  savedWalksButton: {
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#2196F3',
    borderRadius: 20,
  },
  savedWalksButtonDisabled: {
    backgroundColor: '#B0BEC5',
  },
  savedWalksButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  savedWalksButtonTextDisabled: {
    color: '#ECEFF1',
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2196F3',
    borderWidth: 2,
    borderColor: 'white',
    zIndex: 2,
  },
  markerPulse: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(33, 150, 243, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(33, 150, 243, 0.5)',
    zIndex: 1,
  },
  markerRing: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(33, 150, 243, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(33, 150, 243, 0.3)',
    zIndex: 0,
  },
}); 