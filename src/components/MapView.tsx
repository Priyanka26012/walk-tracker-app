import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import MapView, { Polyline, PROVIDER_GOOGLE, Marker, Region, MapViewProps } from 'react-native-maps';
import { Coordinate } from '../types/walk';
import { StyleSheet, View, Text } from 'react-native';

// Extend MapViewProps for generic usage
type CustomMapViewProps = MapViewProps & {
  currentCords?: Coordinate[];
  currentLocation?: Coordinate;
  setUserZoomed?: (userZoomed: boolean) => void;
  showStartEndMarkers?: boolean;
};

const CustomMapView = forwardRef<MapView | null, CustomMapViewProps>(({
  currentCords = [],
  currentLocation,
  setUserZoomed,
  showStartEndMarkers,
  ...rest
}, ref) => {
  const mapViewRef = useRef<MapView | null>(null);

  useImperativeHandle(ref, () => {
    const mapView = mapViewRef.current;
    if (mapView) {
      return {
        fitToCoordinates: (coordinates: Coordinate[], options: any) => {
          if (mapView && coordinates && coordinates.length > 0) {
            mapView.fitToCoordinates(coordinates, options);
          }
        },
        animateToRegion: (region: Region, duration?: number) => {
          if (mapView) {
            mapView.animateToRegion(region, duration);
          }
        },
      } as MapView;
    }
    // Return a stub with the required methods to satisfy the type
    return {
      fitToCoordinates: () => {},
      animateToRegion: () => {},
    } as unknown as MapView;
  }, []);

  const handleRegionChangeComplete = (region: Region) => {
    if (region.latitudeDelta !== 0.001 && setUserZoomed) {
      setUserZoomed(true);
    }
  };

  return (
    <MapView
      ref={mapViewRef}
      provider={PROVIDER_GOOGLE}
      onRegionChangeComplete={handleRegionChangeComplete} 
      {...rest}
    >
      {currentLocation && (
        <Marker
          coordinate={{
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
          }}
          anchor={{ x: 0.5, y: 0.5 }}
        >
          <View style={styles.markerContainer}>
            <View style={styles.markerPulse} />
            <View style={styles.markerDot} />
            <View style={styles.markerRing} />
          </View>
        </Marker>
      )}
      {currentCords && currentCords.length > 1 && (
        <>
          <Polyline
            coordinates={currentCords}
            strokeColor="#4285F4"
            strokeWidth={4}
            lineCap="round"
            lineJoin="round"
            zIndex={1}
          />
          {showStartEndMarkers && (
            <>
              {/* Start Marker */}
              <Marker
                coordinate={currentCords[0]}
                anchor={{ x: 0.5, y: 1 }}
                title="Start"
              >
                <View style={styles.startMarker}>
                  <Text style={styles.markerText}>S</Text>
                </View>
              </Marker>
              {/* End Marker */}
              <Marker
                coordinate={currentCords[currentCords.length - 1]}
                anchor={{ x: 0.5, y: 1 }}
                title="End"
              >
                <View style={styles.endMarker}>
                  <Text style={styles.markerText}>E</Text>
                </View>
              </Marker>
            </>
          )}
        </>
      )}
    </MapView>
  );
});

export default CustomMapView;

const styles = StyleSheet.create({
  map: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4285F4',
    borderWidth: 2,
    borderColor: 'white',
    zIndex: 2,
  },
  markerPulse: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(66, 133, 244, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(66, 133, 244, 0.5)',
    zIndex: 1,
  },
  markerRing: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(66, 133, 244, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(66, 133, 244, 0.25)',
    zIndex: 0,
  },
  startMarker: {
    backgroundColor: '#4CAF50',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  endMarker: {
    backgroundColor: '#F44336',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  markerText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
}); 