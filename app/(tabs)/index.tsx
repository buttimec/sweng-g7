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
import { useApiCacheStore, TripUpdate } from "@/store/apiCacheStore"; // adjust the path accordingly

export default function Index() {
  const { setUserLocation, userLatitude, userLongitude } = useLocationStore();
  const { tripUpdates, tripUpdatesTimestamp, setTripUpdates, nearbyBuses: cachedNearbyBuses, nearbyBusesTimestamp, setNearbyBuses: cacheNearbyBuses } = useApiCacheStore();
  const [hasPermissions, setHasPermissions] = useState(false);
  const [nearbyBuses, setNearbyBuses] = useState<any[]>([]);
  const [savedBuses, setSavedBuses] = useState<any[]>([]);
  const [loadingTripUpdates, setLoadingTripUpdates] = useState<boolean>(true);
  const [busesLoading, setBusesLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [personalDetails, setPersonalDetails] = useState({ name: '', email: '' });

  // Request location and set user location
  useEffect(() => {
    const requestLocation = async () => {
      console.log("Method: requestLocation - Requesting location permissions...");
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setHasPermissions(false);
        console.error("Method: requestLocation - Location permission not granted");
        return;
      }
      setHasPermissions(true);
      const location = await Location.getCurrentPositionAsync();
      const address = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      const loc = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        address: `${address[0]?.name || 'Unknown'}, ${address[0]?.region || 'Unknown'}`,
      };
      console.log("Method: requestLocation - User location set to:", loc);
      setUserLocation(loc);
    };
    if (!userLatitude || !userLongitude) {
      requestLocation();
    }
  }, [setUserLocation, userLatitude, userLongitude]);

  // Fetch user details
  useEffect(() => {
    const fetchUserDetails = async () => {
      console.log("Method: fetchUserDetails - Called");
      try {
        const response = await fetch(`${BACKEND_URL}/api/users/1`);
        console.log('Method: fetchUserDetails - User details status:', response.status);
        if (response.ok) {
          const data = await response.json();
          console.log("Method: fetchUserDetails - Received data:", data);
          setPersonalDetails(data);
        } else {
          console.warn(`Method: fetchUserDetails - User not found or error: ${response.status}`);
        }
      } catch (error: any) {
        console.error('Method: fetchUserDetails - Error fetching user:', error.message);
      }
    };
    fetchUserDetails();
  }, []);

  // Fetch saved buses
  const fetchSavedBuses = async () => {
    console.log("Method: fetchSavedBuses - Called: Fetching saved buses...");
    try {
      const res = await fetch(`${BACKEND_URL}/api/buses`);
      if (res.ok) {
        const data = await res.json();
        console.log("Method: fetchSavedBuses - Saved buses received:", data);
        setSavedBuses(data);
      } else {
        console.error("Method: fetchSavedBuses - Failed to fetch saved buses:", res.statusText);
      }
    } catch (err) {
      console.error("Method: fetchSavedBuses - Error fetching saved buses:", err);
    }
  };

  // Fetch trip updates (with caching)
  const fetchTripUpdates = useCallback(async () => {
    console.log("Method: fetchTripUpdates - Called");
    const now = Date.now();
    const cacheTTL = 120000; // Cache valid for 120 seconds
    if (tripUpdates && tripUpdatesTimestamp && now - tripUpdatesTimestamp < cacheTTL) {
      console.log("Method: fetchTripUpdates - Using cached trip updates");
      setLoadingTripUpdates(false);
      return;
    }
    setLoadingTripUpdates(true);
    console.log("Method: fetchTripUpdates - Fetching trip updates from API...");
    try {
      const response = await fetch(`${BACKEND_URL}/api/trip-updates`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      console.log("Method: fetchTripUpdates - Trip updates response received");
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      const data: TripUpdate[] = await response.json();
      console.log("Method: fetchTripUpdates - Trip updates data:", data);
      setTripUpdates(data, now);
      setError(null);
    } catch (err) {
      console.error("Method: fetchTripUpdates - Error in fetchTripUpdates:", err);
      setError(`Fetch error: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setLoadingTripUpdates(false);
      setRefreshing(false);
      console.log("Method: fetchTripUpdates - Finished fetching trip updates");
    }
  }, [tripUpdates, tripUpdatesTimestamp, setTripUpdates]);

  // Fetch nearby buses using cache if possible
  const fetchNearbyBuses = async (attempt = 1) => {
    console.log(`Method: fetchNearbyBuses - Called, attempt ${attempt}`);
    if (!userLatitude || !userLongitude) {
      console.log("Method: fetchNearbyBuses - User location is not set.");
      return;
    }
    const now = Date.now();
    const cacheTTL = 120000; // Cache valid for 120 seconds
    if (cachedNearbyBuses && nearbyBusesTimestamp && now - nearbyBusesTimestamp < cacheTTL) {
      console.log("Method: fetchNearbyBuses - Using cached nearby buses");
      setNearbyBuses(cachedNearbyBuses);
      return;
    }
    setBusesLoading(true);
    const url = `${BACKEND_URL}/getNearbyBuses?lat=${userLatitude}&lng=${userLongitude}&radius=50`;
    console.log("Method: fetchNearbyBuses - Fetching from URL:", url);
    try {
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        console.log("Method: fetchNearbyBuses - Nearby buses:", data);
        const limitedBuses = data.slice(0, 20); // Limit to max 20 entries
        setNearbyBuses(limitedBuses);
        cacheNearbyBuses(limitedBuses, now);
      } else {
        console.error("Method: fetchNearbyBuses - Error fetching nearby buses:", response.status, response.statusText);
        if (attempt < 3) {
          console.log(`Method: fetchNearbyBuses - Retrying, attempt ${attempt + 1}...`);
          setTimeout(() => fetchNearbyBuses(attempt + 1), 2000);
        }
      }
    } catch (error: any) {
      console.error("Method: fetchNearbyBuses - Error fetching nearby buses:", error);
      if (attempt < 3) {
        console.log(`Method: fetchNearbyBuses - Retrying, attempt ${attempt + 1}...`);
        setTimeout(() => fetchNearbyBuses(attempt + 1), 2000);
      }
    } finally {
      setBusesLoading(false);
    }
  };

  // Fetch nearby buses first, then saved buses and trip updates (tring to limit API calls)
  useEffect(() => {
    if (userLatitude && userLongitude) {
      console.log("Method: useEffect [userLatitude, userLongitude] - User location available; Fetching nearby departures first, then saved buses and trip updates...");
      fetchNearbyBuses().then(() => {
        console.log("Method: useEffect [userLatitude, userLongitude] - Nearby departures fetched; now fetching saved buses and trip updates...");
        fetchSavedBuses();
        fetchTripUpdates();
      });
    } else {
      console.log("Method: useEffect [userLatitude, userLongitude] - Waiting for user location...");
    }
  }, [userLatitude, userLongitude, fetchTripUpdates]);

  const onRefresh = () => {
    setRefreshing(true);
    // Clear cached timestamp to force a new fetch
    setTripUpdates(null, 0);
    // Re-fetch nearby buses first, then other calls
    fetchNearbyBuses().then(() => {
      fetchSavedBuses();
      fetchTripUpdates();
    });
  };

  // Helper: Format time from "HH:mm:ss" to "h:mm AM/PM"
  const formatTime = (timeString: string) => {
    const [hour, minute] = timeString.split(':');
    let hourNum = parseInt(hour, 10);
    const ampm = hourNum >= 12 ? 'PM' : 'AM';
    hourNum = hourNum % 12;
    hourNum = hourNum ? hourNum : 12;
    return `${hourNum}:${minute} ${ampm}`;
  };

  const getMinutesFromTimeString = (timeString: string) => {
    const [hour, minute] = timeString.split(':').map(Number);
    return hour * 60 + minute;
  };

  const formatDateTime = (date: Date) => {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const minutesStr = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${minutesStr} ${ampm}`;
  };

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // order them by time, also only ones later than current time are shown (gtfs sometimes returns ones before)
  const filteredSortedNearbyBuses = nearbyBuses
    .filter(bus => getMinutesFromTimeString(bus.startTime) > currentMinutes)
    .sort((a, b) => getMinutesFromTimeString(a.startTime) - getMinutesFromTimeString(b.startTime));

  // Filter trip updates to only include updates relevant to saved buses
  const savedBusRoutes = savedBuses.map(bus => bus.route);
  const filteredUpdates = tripUpdates
    ? tripUpdates.filter(update => savedBusRoutes.includes(update.routeShortName))
    : [];

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
      </View>

      <View style={styles.card}>
        <Text style={styles.cardHeader}>Nearby Departures</Text>
        <Text style={styles.infoText}>
          Current Time: {formatDateTime(new Date())} | Updated at:{' '}
          {nearbyBusesTimestamp ? formatDateTime(new Date(nearbyBusesTimestamp)) : 'N/A'}
        </Text>
        {filteredSortedNearbyBuses.length > 0 ? (
          filteredSortedNearbyBuses.map(bus => (
            <View key={bus.vehicleId} style={styles.departureItem}>
              <Text style={styles.departureText}>
                {formatTime(bus.startTime)} - {bus.routeLongName} ({bus.routeShortName})
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.noData}>No nearby departures available. Refresh Page</Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardHeader}>Latest Updates On Saved Buses</Text>
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
                ⏳ Delay: <Text style={styles.bold}>{formatTime(item.startTime)}</Text>
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
    textAlign: 'center',
  },
  departureItem: {
    marginBottom: 8,
  },
  departureText: {
    fontSize: 16,
    color: '#333',
  },
  noData: {
    textAlign: 'center',
    fontSize: 18,
    color: '#555',
    marginTop: 20,
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
  bold: {
    fontWeight: 'bold',
  },
  error: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
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
  infoText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
});

export default Index;
