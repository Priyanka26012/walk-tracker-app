import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

const WalkListScreen = ({ navigation }: any) => {
  const [walks, setWalks] = useState<Walk[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWalks();
  }, []);

  const loadWalks = async () => {
    try {
      const savedWalks = await AsyncStorage.getItem('walks');
      if (savedWalks) {
        const parsedWalks = JSON.parse(savedWalks);
        setWalks(parsedWalks.reverse()); // Show newest first
      }
    } catch (error) {
      console.error('Load walks error:', error);
      Alert.alert('Error', 'Failed to load walks');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const deleteWalk = async (walkId: string) => {
    Alert.alert(
      'Delete Walk',
      'Are you sure you want to delete this walk?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedWalks = walks.filter(walk => walk.id !== walkId);
              await AsyncStorage.setItem('walks', JSON.stringify(updatedWalks));
              setWalks(updatedWalks);
            } catch (error) {
              console.error('Delete walk error:', error);
              Alert.alert('Error', 'Failed to delete walk');
            }
          },
        },
      ]
    );
  };

  const renderWalkItem = ({ item }: { item: Walk }) => (
    <View style={styles.walkItem}>
      <TouchableOpacity
        style={styles.walkContent}
        onPress={() => navigation.navigate('WalkDetail', { walk: item })}
      >
        <Text style={styles.walkDate}>{formatDate(item.timestamp)}</Text>
        <Text style={styles.walkDuration}>Duration: {formatDuration(item.duration)}</Text>
        <Text style={styles.walkPoints}>{item.coordinates.length} GPS points</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteWalk(item.id)}
      >
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>Loading walks...</Text>
      </View>
    );
  }

  if (walks.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>No walks saved yet</Text>
        <Text style={styles.emptySubtext}>Start your first walk from the home screen!</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={walks}
        keyExtractor={(item) => item.id}
        renderItem={renderWalkItem}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  listContainer: {
    padding: 15,
  },
  walkItem: {
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 15,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  walkContent: {
    flex: 1,
  },
  walkDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  walkDuration: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 3,
  },
  walkPoints: {
    fontSize: 12,
    color: '#666',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default WalkListScreen; 