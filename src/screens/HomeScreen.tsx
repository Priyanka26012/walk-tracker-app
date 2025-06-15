import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import MapView, { Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';

interface Coordinate {
  latitude: number;
  longitude: number;
}

interface Walk {
  id: string;
  coordinates: Coordinate[];
  duration: number;
  timestamp: number;
}

const HomeScreen = ({ navigation }: any) => {
  const [isWalking, setIsWalking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<Coordinate | null>(null);
  const [walkCoordinates, setWalkCoordinates] = useState<Coordinate[]>([]);
  const [walkDuration, setWalkDuration] = useState(0);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [locationPermissionGranted, setLocationPermissionGranted] = useState(false);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const getCurrentLocation = useCallback(() => {
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ latitude, longitude });
        console.log('Location obtained:', { latitude, longitude });
      },
      (error) => {
        console.error('Location error:', error);
        Alert.alert(
          'Location Error', 
          'Unable to get current location. Please make sure GPS is enabled and try again.',
          [
            { text: 'Retry', onPress: getCurrentLocation },
            { text: 'Cancel', style: 'cancel' }
          ]
        );
      },
      { 
        enableHighAccuracy: true, 
        timeout: 20000, 
        maximumAge: 10000 
      }
    );
  }, []);

  useEffect(() => {
    if (locationPermissionGranted) {
      getCurrentLocation();
    }
  }, [locationPermissionGranted, getCurrentLocation]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isWalking && startTime) {
      interval = setInterval(() => {
        setWalkDuration(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isWalking, startTime]);

  const requestLocationPermission = async () => {
    try {
      let permission;
      if (Platform.OS === 'ios') {
        permission = PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;
      } else {
        permission = PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
      }

      const result = await request(permission);
      if (result === RESULTS.GRANTED) {
        setLocationPermissionGranted(true);
      } else {
        Alert.alert(
          'Permission Required', 
          'Location permission is required to track walks. Please enable it in settings.',
          [
            { text: 'OK', onPress: () => {} }
          ]
        );
      }
    } catch (error) {
      console.error('Permission error:', error);
      Alert.alert('Error', 'Failed to request location permission');
    }
  };

  const startWalk = () => {
    if (!locationPermissionGranted) {
      Alert.alert('Permission Required', 'Please grant location permission first.');
      requestLocationPermission();
      return;
    }

    if (!currentLocation) {
      Alert.alert(
        'Location Not Available', 
        'Getting your location... Please wait a moment and try again.',
        [
          { text: 'Get Location', onPress: getCurrentLocation },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
      getCurrentLocation();
      return;
    }

    console.log('Starting walk with location:', currentLocation);
    setIsWalking(true);
    setStartTime(Date.now());
    setWalkCoordinates([currentLocation]);
    setWalkDuration(0);

    const id = Geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newCoordinate = { latitude, longitude };
        console.log('New coordinate:', newCoordinate);
        setCurrentLocation(newCoordinate);
        setWalkCoordinates(prev => [...prev, newCoordinate]);
      },
      (error) => {
        console.error('Watch position error:', error);
        Alert.alert('Tracking Error', 'GPS tracking encountered an issue. Walk will continue with last known location.');
      },
      { 
        enableHighAccuracy: true, 
        distanceFilter: 5,
        interval: 5000,
        fastestInterval: 2000
      }
    );

    setWatchId(id);
  };

  const stopWalk = async () => {
    if (watchId !== null) {
      Geolocation.clearWatch(watchId);
      setWatchId(null);
    }

    setIsWalking(false);

    if (walkCoordinates.length > 1) {
      const walk: Walk = {
        id: Date.now().toString(),
        coordinates: walkCoordinates,
        duration: walkDuration,
        timestamp: Date.now(),
      };

      try {
        const existingWalks = await AsyncStorage.getItem('walks');
        const walks = existingWalks ? JSON.parse(existingWalks) : [];
        walks.push(walk);
        await AsyncStorage.setItem('walks', JSON.stringify(walks));
        Alert.alert('Success', 'Walk saved successfully!');
      } catch (error) {
        console.error('Save error:', error);
        Alert.alert('Error', 'Failed to save walk');
      }
    }

    setWalkCoordinates([]);
    setWalkDuration(0);
    setStartTime(null);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={currentLocation ? {
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        } : undefined}
        showsUserLocation={true}
        followsUserLocation={true}
      >
        {walkCoordinates.length > 1 && (
          <Polyline
            coordinates={walkCoordinates}
            strokeColor="#007AFF"
            strokeWidth={4}
          />
        )}
      </MapView>

      {/* Debug Status */}
      <View style={styles.debugContainer}>
        <Text style={styles.debugText}>
          Permission: {locationPermissionGranted ? '✅' : '❌'} | 
          Location: {currentLocation ? '✅' : '❌'}
        </Text>
        {currentLocation && (
          <Text style={styles.debugText}>
            Lat: {currentLocation.latitude.toFixed(6)}, Lng: {currentLocation.longitude.toFixed(6)}
          </Text>
        )}
      </View>

      <View style={styles.controls}>
        {isWalking && (
          <View style={styles.durationContainer}>
            <Text style={styles.durationText}>
              Duration: {formatDuration(walkDuration)}
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.button, isWalking ? styles.stopButton : styles.startButton]}
          onPress={isWalking ? stopWalk : startWalk}
          disabled={!locationPermissionGranted || !currentLocation}
        >
          <Text style={styles.buttonText}>
            {isWalking ? 'Stop Walk' : 'Start Walk'}
          </Text>
        </TouchableOpacity>

        {!locationPermissionGranted && (
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={requestLocationPermission}
          >
            <Text style={styles.permissionButtonText}>Grant Location Permission</Text>
          </TouchableOpacity>
        )}

        {locationPermissionGranted && !currentLocation && (
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={getCurrentLocation}
          >
            <Text style={styles.permissionButtonText}>Get Current Location</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.listButton}
          onPress={() => navigation.navigate('WalkList')}
        >
          <Text style={styles.listButtonText}>View Saved Walks</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  controls: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  durationContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 20,
  },
  durationText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  button: {
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 15,
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
    textAlign: 'center',
  },
  listButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 20,
  },
  listButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  debugContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 10,
    borderRadius: 10,
  },
  debugText: {
    color: 'white',
    fontSize: 16,
  },
  permissionButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 20,
    marginBottom: 15,
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HomeScreen;
