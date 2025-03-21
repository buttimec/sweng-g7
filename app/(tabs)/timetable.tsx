import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator, 
  RefreshControl, 
  Button,
  TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { BACKEND_URL } from '@/config';

const API_URL = `${BACKEND_URL}/api/trip-updates`;

// ✅ Define TypeScript Interface for the API response
interface TripUpdate {
  routeShortName: string;
  totalDelay: number; // Delay is in seconds from API
  stopName: string;
  transportation: string;
}

// ✅ Convert seconds to minutes for display
const formatDelay = (seconds: number): string => {
  if (seconds < 60) return `< 1 min`;
  return `${Math.round(seconds / 60)} min`;
};

const Timetable: React.FC = () => {
  const router = useRouter();
  const [timetable, setTimetable] = useState<TripUpdate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ Fetch trip updates
  const fetchTimetable = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(API_URL, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      const data: TripUpdate[] = await response.json();
      if (!Array.isArray(data)) {
        throw new Error("Invalid API response format - expected an array.");
      }
      setTimetable(data);
      setError(null);
    } catch (err) {
      setError(`❌ Fetch error: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // ✅ useEffect to fetch timetable on mount
  useEffect(() => {
    fetchTimetable();
  }, [fetchTimetable]);

  // ✅ Pull-to-refresh functionality
  const onRefresh = () => {
    setRefreshing(true);
    fetchTimetable();
  };

  // ✅ Manual trigger for debugging
  const debugFetch = () => {
    fetchTimetable();
  };

  return (
    <View style={styles.fullContainer}>   
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text>Loading trip updates...</Text>
          <Button title="Retry" onPress={debugFetch} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.error}>❌ Error: {error}</Text>
          <Button title="Retry Fetch" onPress={fetchTimetable} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.container}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <Text style={styles.header}>🚌 Real-time Trip Updates</Text>
          <Button title="Debug Fetch" onPress={debugFetch} color="#007AFF" />
          {timetable.length > 0 ? (
            timetable.map((item, index) => (
              <View key={index} style={styles.card}>
                <Text style={styles.routeText}>
                  📍 Route: <Text style={styles.bold}>{item.routeShortName}</Text>
                </Text>
                <Text style={styles.stopText}>
                  🚏 Stop: <Text style={styles.bold}>{item.stopName}</Text>
                </Text>
                <Text style={styles.delayText}>
                  ⏳ Delay: <Text style={styles.bold}>{formatDelay(item.totalDelay)}</Text>
                </Text>
                <Text style={styles.transportationText}>
                  🚌 Transport: <Text style={styles.bold}>{item.transportation}</Text>
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.noData}>No trip updates available.</Text>
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  fullContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 5,
    backgroundColor: '#F8F9FA',
  },
  backArrow: {
    
  },
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: '#F8F9FA',
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  card: {
    backgroundColor: 'white',
    padding: 15,
    marginVertical: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3, 
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
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
});

export default Timetable;
