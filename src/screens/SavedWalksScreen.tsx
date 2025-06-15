import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Text,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Walk } from '../types/walk';
import { SavedWalksScreenProps } from '../types/navigation';
import useWalkList from '../hooks/useWalkList';
import CustomMapView from '../components/MapView';
import MapView from 'react-native-maps';
import { locationService } from '../services/locationService';
import { formatDuration } from '../utils/common-functions';
import Card from '../components/Card';

const INITIAL_REGION = {
  latitude: 37.78825,
  longitude: -122.4324,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

export const SavedWalksScreen = ({ navigation: _navigation }: SavedWalksScreenProps) => {
  const { walkList: savedWalks, clearAllWalks, deleteWalk } = useWalkList();
  const [selectedWalk, setSelectedWalk] = useState<Walk | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [initialMapRegion, setInitialMapRegion] = useState(INITIAL_REGION);
  const mapRef = useRef<MapView | null>(null);
  const [loading, setLoading] = useState(true);
  const loadUserLocation = async () => {
    try {
      const lastLocation = await locationService.getLastLocation();
      if (lastLocation) {
        setUserLocation(lastLocation);
        setInitialMapRegion({
          latitude: lastLocation.latitude,
          longitude: lastLocation.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
        setLoading(false);
        return;
      }
      const currentLocation = await locationService.getCurrentLocation();
      setUserLocation(currentLocation);
      setInitialMapRegion({
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
      setLoading(false);
    } catch (error) {
      console.error('Error getting user location:', error);
      setLoading(false);
    }
  };
  useEffect(() => {
    loadUserLocation();
  }, []);

  useEffect(() => {
    if (selectedWalk && selectedWalk.coordinates.length > 0 && mapRef.current) {
      const timer = setTimeout(() => {
        try {
          if (mapRef.current && selectedWalk.coordinates.length > 1) {
            mapRef.current.fitToCoordinates(selectedWalk.coordinates, {
              edgePadding: { top: 100, right: 50, bottom: 50, left: 50 },
              animated: true,
            });
          }
        } catch (error) {
          console.error('Error fitting map to coordinates:', error);
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [selectedWalk]);

  const handleWalkPress = (walk: Walk) => {
    setSelectedWalk(walk);
  };
  const handleDeleteWalk = (id: string) => {
    deleteWalk(id);
  };

  return (
    <View style={styles.container}>
      {loading && !userLocation ? (
        <ActivityIndicator size="large" color="#4285F4" style={styles.loading} />
      ) : (
        <CustomMapView
          ref={mapRef}
          currentCords={selectedWalk?.coordinates || []}
          currentLocation={selectedWalk ? undefined : userLocation || { latitude: INITIAL_REGION.latitude, longitude: INITIAL_REGION.longitude }}
          initialRegion={initialMapRegion}
          style={styles.map}
          showStartEndMarkers={!!selectedWalk}
        />
      )}

      <View style={styles.listContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Saved Walks</Text>
          <TouchableOpacity
            style={[styles.clearAllButton, savedWalks.length === 0 && styles.clearAllButtonDisabled]}
            onPress={() => {
              Alert.alert(
                'Clear All Walks',
                'Are you sure you want to delete all saved walks?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Clear All',
                    style: 'destructive',
                    onPress: clearAllWalks,
                  },
                ]
              );
            }}
            disabled={savedWalks.length === 0}
          >
            <Text style={[styles.clearAllButtonText, savedWalks.length === 0 && styles.clearAllButtonTextDisabled]}>Clear All</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          ListEmptyComponent={<Text>No saved walks</Text>}
          data={savedWalks}
          maxToRenderPerBatch={10}
          initialNumToRender={10}
          renderItem={({ item }) => (
            <Card item={item} handleWalkPress={() => handleWalkPress(item)} handleDeleteWalk={() => handleDeleteWalk(item.id)} />
          )}
          keyExtractor={(item) => item.id}
          style={styles.list}
        />
      </View>

      {selectedWalk && (
        <View style={styles.walkInfoOverlay}>
          <Text style={styles.walkInfoTitle}>Selected Walk</Text>
          <Text style={styles.walkInfoDuration}>
            Duration: {formatDuration(selectedWalk.duration)}
          </Text>
          <Text style={styles.walkInfoDate}>
            {new Date(selectedWalk.startTime).toLocaleDateString()} at {new Date(selectedWalk.startTime).toLocaleTimeString()}
          </Text>
          <TouchableOpacity
            style={styles.clearSelectionButton}
            onPress={() => setSelectedWalk(null)}
          >
            <Text style={styles.clearSelectionText}>Clear Selection</Text>
          </TouchableOpacity>
        </View>
      )}
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
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '50%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  clearAllButton: {
    backgroundColor: '#F44336',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  clearAllButtonDisabled: {
    backgroundColor: '#ccc',
  },
  clearAllButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  clearAllButtonTextDisabled: {
    color: '#eee',
  },
  list: {
    flex: 1,
  },
  walkItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  walkInfo: {
    flex: 1,
  },
  walkDate: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  walkDuration: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  walkInfoOverlay: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  walkInfoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  walkInfoDuration: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4285F4',
    marginBottom: 6,
  },
  walkInfoDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  clearSelectionButton: {
    backgroundColor: '#4285F4',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  clearSelectionText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
}); 