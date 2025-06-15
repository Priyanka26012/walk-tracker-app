import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import MapView, { Polyline, Marker, PROVIDER_GOOGLE } from 'react-native-maps';

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

const WalkDetailScreen = ({ route }: any) => {
  const { walk }: { walk: Walk } = route.params;
  const mapRef = useRef<MapView>(null);
  const [selectedPointIndex, setSelectedPointIndex] = useState<number | null>(null);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const calculateDistance = (coordinates: Coordinate[]) => {
    if (coordinates.length < 2) return 0;
    
    let totalDistance = 0;
    for (let i = 1; i < coordinates.length; i++) {
      const prev = coordinates[i - 1];
      const curr = coordinates[i];
      
      // Haversine formula for distance calculation
      const R = 6371; // Earth's radius in kilometers
      const dLat = (curr.latitude - prev.latitude) * Math.PI / 180;
      const dLon = (curr.longitude - prev.longitude) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(prev.latitude * Math.PI / 180) * Math.cos(curr.latitude * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = R * c;
      
      totalDistance += distance;
    }
    
    return totalDistance;
  };

  const getMapRegion = (coordinates: Coordinate[]) => {
    if (coordinates.length === 0) return undefined;

    let minLat = coordinates[0].latitude;
    let maxLat = coordinates[0].latitude;
    let minLng = coordinates[0].longitude;
    let maxLng = coordinates[0].longitude;

    coordinates.forEach(coord => {
      minLat = Math.min(minLat, coord.latitude);
      maxLat = Math.max(maxLat, coord.latitude);
      minLng = Math.min(minLng, coord.longitude);
      maxLng = Math.max(maxLng, coord.longitude);
    });

    const latDelta = (maxLat - minLat) * 1.1; // Slightly increased padding for better visibility
    const lngDelta = (maxLng - minLng) * 1.1;

    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: Math.max(latDelta, 0.005), // Increased minimum zoom for better path visibility
      longitudeDelta: Math.max(lngDelta, 0.005),
    };
  };

  const distance = calculateDistance(walk.coordinates);

  const zoomToLocation = (coordinate: Coordinate, zoomLevel: number = 0.002) => {
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
        latitudeDelta: zoomLevel,
        longitudeDelta: zoomLevel,
      }, 1000);
    }
  };

  const handlePolylinePress = (event: any) => {
    const { coordinate } = event.nativeEvent;
    
    // Find the closest point on the path
    let closestIndex = 0;
    let minDistance = Number.MAX_VALUE;
    
    walk.coordinates.forEach((coord, index) => {
      const distance = Math.sqrt(
        Math.pow(coord.latitude - coordinate.latitude, 2) + 
        Math.pow(coord.longitude - coordinate.longitude, 2)
      );
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = index;
      }
    });
    
    setSelectedPointIndex(closestIndex);
    zoomToLocation(walk.coordinates[closestIndex]);
  };

  const getWaypoints = () => {
    if (walk.coordinates.length < 10) return [];
    
    const waypoints = [];
    const interval = Math.floor(walk.coordinates.length / 5); // Show 5 waypoints
    
    for (let i = interval; i < walk.coordinates.length - interval; i += interval) {
      waypoints.push({
        coordinate: walk.coordinates[i],
        index: i,
        title: `Point ${i + 1}`,
        description: `Waypoint along the route`
      });
    }
    
    return waypoints;
  };

  const resetZoom = () => {
    if (mapRef.current) {
      mapRef.current.animateToRegion(getMapRegion(walk.coordinates)!, 1000);
      setSelectedPointIndex(null);
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={getMapRegion(walk.coordinates)}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {walk.coordinates.length > 1 && (
          <Polyline
            coordinates={walk.coordinates}
            strokeColor="#007AFF"
            strokeWidth={5}
            lineCap="round"
            lineJoin="round"
            tappable={true}
            onPress={handlePolylinePress}
          />
        )}
        
        {/* Start marker */}
        {walk.coordinates.length > 0 && (
          <Marker
            coordinate={walk.coordinates[0]}
            title="Start"
            description="Walk started here"
            pinColor="green"
            onPress={() => zoomToLocation(walk.coordinates[0])}
          />
        )}
        
        {/* End marker */}
        {walk.coordinates.length > 1 && (
          <Marker
            coordinate={walk.coordinates[walk.coordinates.length - 1]}
            title="End"
            description="Walk ended here"
            pinColor="red"
            onPress={() => zoomToLocation(walk.coordinates[walk.coordinates.length - 1])}
          />
        )}
        
        {/* Waypoint markers */}
        {getWaypoints().map((waypoint, index) => (
          <Marker
            key={`waypoint-${index}`}
            coordinate={waypoint.coordinate}
            title={waypoint.title}
            description={waypoint.description}
            pinColor="blue"
            onPress={() => zoomToLocation(waypoint.coordinate)}
          />
        ))}
        
        {/* Selected point marker */}
        {selectedPointIndex !== null && (
          <Marker
            coordinate={walk.coordinates[selectedPointIndex]}
            title={`Point ${selectedPointIndex + 1}`}
            description="Selected location"
            pinColor="orange"
          />
        )}
      </MapView>

      {/* Zoom controls */}
      <View style={styles.zoomControls}>
        <TouchableOpacity style={styles.zoomButton} onPress={resetZoom}>
          <Text style={styles.zoomButtonText}>Reset View</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.zoomButton} 
          onPress={() => walk.coordinates.length > 0 && zoomToLocation(walk.coordinates[0])}
        >
          <Text style={styles.zoomButtonText}>Start</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.zoomButton} 
          onPress={() => walk.coordinates.length > 1 && zoomToLocation(walk.coordinates[walk.coordinates.length - 1])}
        >
          <Text style={styles.zoomButtonText}>End</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.dateText}>{formatDate(walk.timestamp)}</Text>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Duration</Text>
            <Text style={styles.statValue}>{formatDuration(walk.duration)}</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Distance</Text>
            <Text style={styles.statValue}>{distance.toFixed(2)} km</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>GPS Points</Text>
            <Text style={styles.statValue}>{walk.coordinates.length}</Text>
          </View>
        </View>
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
  infoContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  dateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  zoomControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
  },
  zoomButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
  },
  zoomButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default WalkDetailScreen; 