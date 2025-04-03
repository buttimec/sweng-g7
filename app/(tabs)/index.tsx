import React, { useEffect, useState, useCallback } from 'react';
import * as Location from 'expo-location';
import { 
  Text, 
  View, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator, 
  RefreshControl 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocationStore } from "@/store";
import { BACKEND_URL } from '@/config';

interface TripUpdate {
  routeShortName: string;
  totalDelay: number; // delay in seconds
  stopName: string;
  transportation: string;
}

export default function Index() {
  const { setUserLocation, userLocation } = useLocationStore();
  const [hasPermissions, setHasPermissions] = useState(false);

  // Sample data for nearby departures
  const [departures] = useState([
    { id: '1', route: 'Route 1', departureTime: '12:05 PM' },
    { id: '2', route: 'Route 2', departureTime: '12:15 PM' },
    { id: '3', route: 'Route 3', departureTime: '12:30 PM' },
  ]);

  const [savedBuses, setSavedBuses] = useState<any[]>([]);
  const [tripUpdates, setTripUpdates] = useState<TripUpdate[]>([]);
  const [loadingTripUpdates, setLoadingTripUpdates] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // NEW: Personal details fetched from backend for context (e.g. user's name)
  const [personalDetails, setPersonalDetails] = useState({ name: '', email: '' });

  useEffect(() => {
    const requestLocation = async () => {
      console.log("Requesting location permissions...");
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setHasPermissions(false);
        console.error("Location permission not granted");
        return;
      }
      setHasPermissions(true);
      let location = await Location.getCurrentPositionAsync();
      const address = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      const loc = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        address: `${address[0]?.name || 'Unknown'}, ${address[0]?.region || 'Unknown'}`,
      };
      console.log("User location set to:", loc);
      setUserLocation(loc);
    };
    requestLocation();
  }, [setUserLocation]);

  // NEW: Fetch personal details
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/users/1`);
        console.log('User details status:', response.status);
        if (response.ok) {
          const data = await response.json();
          setPersonalDetails(data);
        } else {
          console.warn(`User not found or error: ${response.status}`);
        }
      } catch (error) {
        console.error('Error fetching user:', error.message);
      }
    };

    fetchUserDetails();
  }, []);

  // Fetch saved buses 
  const fetchSavedBuses = async () => {
    console.log("Fetching saved buses...");
    try {
      const res = await fetch(`${BACKEND_URL}/api/buses`);
      if (res.ok) {
        const data = await res.json();
        console.log("Saved buses received:", data);
        setSavedBuses(data);
      } else {
        console.error("Failed to fetch saved buses:", res.statusText);
      }
    } catch (err) {
      console.error("Error fetching saved buses:", err);
    }
  };

  // Fetch trip updates from gtfs
  const fetchTripUpdates = useCallback(async () => {
    setLoadingTripUpdates(true);
    console.log("Fetching trip updates...");
    try {
      const response = await fetch(`${BACKEND_URL}/api/trip-updates`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      console.log("Trip updates response received");
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      const data: TripUpdate[] = await response.json();
      console.log("Trip updates data:", data);
      setTripUpdates(data);
      setError(null);
    } catch (err) {
      setError(`Fetch error: ${err instanceof Error ? err.message : "Unknown error"}`);
      console.error("Error in fetchTripUpdates:", err);
    } finally {
      setLoadingTripUpdates(false);
      setRefreshing(false);
      console.log("Finished fetching trip updates");
    }
  }, []);

  useEffect(() => {
    if (userLocation) {
      console.log("User location available; fetching saved buses and trip updates.");
      fetchSavedBuses();
      fetchTripUpdates();
    } else {
      console.log("Waiting for user location...");
    }
  }, [userLocation, fetchTripUpdates]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSavedBuses();
    fetchTripUpdates();
  };

  const formatDelay = (seconds: number): string => {
    if (seconds < 60) return `< 1 min`;
    return `${Math.round(seconds / 60)} min`;
  };

  // Filter trip updates to only include those matching a saved bus.
  const savedBusRoutes = savedBuses.map(bus => bus.route);
  const filteredUpdates = tripUpdates.filter(update =>
    savedBusRoutes.includes(update.routeShortName)
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.welcomeSection}>
        <Text style={styles.header}>
          Welcome to TrinityTransit{personalDetails.name ? `, ${personalDetails.name}` : ''}!
        </Text>
        <Text style={styles.subHeader}>Your Transport Timetabling App</Text>
        {!hasPermissions && (
          <Text style={styles.permissionWarning}>Location permissions not granted.</Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardHeader}>Nearby Departures</Text>
        {departures.map((dep) => (
          <View key={dep.id} style={styles.departureItem}>
            <Text style={styles.departureText}>
              {dep.route} - {dep.departureTime}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardHeader}>Refresh for Latest Updates On Saved Buses</Text>
        {loadingTripUpdates ? (
          <ActivityIndicator size="small" color="#007AFF" />
        ) : error ? (
          <Text style={styles.error}>❌ {error}</Text>
        ) : filteredUpdates.length > 0 ? (
          filteredUpdates.map((item, index) => (
            <View key={index} style={styles.updateCard}>
              <Text style={styles.routeText}>
                📍 Route: <Text style={styles.bold}>{item.routeShortName}</Text>
              </Text>
              <Text style={styles.stopText}>
                🚏 Stop: <Text style={styles.bold}>{item.stopName}</Text>
              </Text>
              <Text style={styles.delayText}>
                ⏳ Delay: <Text style={styles.bold}>{formatDelay(item.totalDelay)}</Text>
              </Text>
            </View>
          ))
        ) : (
          savedBuses.length > 0 ? (
            savedBuses.map((bus, index) => (
              <View key={bus.id || index} style={styles.savedBusRow}>
                <Text style={styles.savedBusText}>
                  {bus.name} - {bus.route}
                </Text>
                <View style={styles.onTimeContainer}>
                  <Ionicons name="checkmark-circle" size={24} color="green" />
                  <Text style={styles.onTimeText}>On Time</Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.noData}>You haven't saved any buses</Text>
          )
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
    padding: 16,
  },
  welcomeSection: {
    marginBottom: 24,
    alignItems: 'center',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  subHeader: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  permissionWarning: {
    color: 'red',
    fontSize: 14,
    marginTop: 8,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
    color: '#444',
  },
  departureItem: {
    marginBottom: 8,
  },
  departureText: {
    fontSize: 16,
    color: '#333',
  },
  updateCard: {
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 6,
    borderColor: '#007AFF',
  },
  routeText: {
    fontSize: 18,
    color: '#007AFF',
    marginBottom: 5,
  },
  stopText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  delayText: {
    fontSize: 16,
    color: '#FF5733',
    marginBottom: 5,
  },
  transportationText: {
    fontSize: 16,
    color: '#28A745',
    marginBottom: 5,
  },
  bold: {
    fontWeight: 'bold',
  },
  error: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
  noData: {
    textAlign: 'center',
    fontSize: 18,
    color: '#555',
    marginTop: 20,
  },
  savedBusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  savedBusText: {
    fontSize: 16,
    color: '#333',
    flexShrink: 1,
    flexWrap: 'wrap',
  },
  onTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  onTimeText: {
    marginLeft: 5,
    fontSize: 16,
    color: 'green',
  },
});

export default Index;
