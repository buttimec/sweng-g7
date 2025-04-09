import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  RefreshControl, 
  Button,
  Switch,
  TextInput,
  FlatList,
  TouchableOpacity,
  Keyboard
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { BACKEND_URL } from '@/config';
import { useApiCacheStore, TripUpdate } from "@/store/apiCacheStore";

const API_URL = `${BACKEND_URL}/api/trip-updates`;

const TRANSPORT_TYPES = [
  "GTFS_Dublin_Bus",
  "GTFS_Bus_Eireann",
  "GTFS_Irish_Rail",
  "GTFS_LUAS"
];

const formatDelay = (seconds: number): string => {
  if (seconds < 60) return `< 1 min`;
  return `${Math.round(seconds / 60)} min`;
};

const CACHE_TTL = 60000;

const Timetable: React.FC = () => {
  const router = useRouter();
  const [timetable, setTimetable] = useState<TripUpdate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  
  const [selectedTransports, setSelectedTransports] = useState<Record<string, boolean>>(
    TRANSPORT_TYPES.reduce((acc, curr) => ({ ...acc, [curr]: true }), {})
  );
  
  const { tripUpdates, tripUpdatesTimestamp, setTripUpdates } = useApiCacheStore();

  const stopNameSuggestions = useMemo(() => {
    const stops = new Set<string>();
    timetable.forEach(item => stops.add(item.stopName));
    return Array.from(stops).sort();
  }, [timetable]);

  const filteredSuggestions = useMemo(() => {
    if (!searchQuery) return [];
    return stopNameSuggestions.filter(stop => 
      stop.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 5);
  }, [searchQuery, stopNameSuggestions]);

  const filteredTimetable = useMemo(() => {
    let filtered = timetable.filter(item => selectedTransports[item.transportation]);
    
    if (searchQuery) {
      filtered = filtered.filter(item => 
        item.stopName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered.slice(0, 30);
  }, [timetable, selectedTransports, searchQuery]);

  const fetchTimetable = useCallback(async () => {
    setLoading(true);
    try {
      const now = Date.now();
      if (tripUpdates && tripUpdatesTimestamp && now - tripUpdatesTimestamp < CACHE_TTL) {
        console.log("Using cached trip updates");
        setTimetable(tripUpdates);
      } else {
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
        setTripUpdates(data, now);
        setError(null);
      }
    } catch (err) {
      setError(`❌ Fetch error: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [tripUpdates, tripUpdatesTimestamp, setTripUpdates]);

  useEffect(() => {
    fetchTimetable();
  }, [fetchTimetable]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTimetable();
  };

  const toggleTransport = (transport: string) => {
    setSelectedTransports(prev => ({
      ...prev,
      [transport]: !prev[transport]
    }));
  };

  const handleSelectSuggestion = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    Keyboard.dismiss();
  };

  const renderItem = ({ item }: { item: TripUpdate }) => (
    <View style={styles.card}>
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
        🚌 Transport: <Text style={styles.bold}>
          {item.transportation.replace('GTFS_', '').replace('_', ' ')}
        </Text>
      </Text>
    </View>
  );

  const renderTransportFilters = () => {
    const transportPairs = [];
    for (let i = 0; i < TRANSPORT_TYPES.length; i += 2) {
      transportPairs.push(TRANSPORT_TYPES.slice(i, i + 2));
    }

    return transportPairs.map((pair, index) => (
      <View key={index} style={styles.filterRow}>
        {pair.map(transport => (
          <View key={transport} style={styles.filterItem}>
            <Switch
              value={selectedTransports[transport]}
              onValueChange={() => toggleTransport(transport)}
              trackColor={{ false: "#767577", true: "#007AFF" }}
              thumbColor="#f4f3f4"
            />
            <Text style={styles.filterLabel}>
              {transport.replace('GTFS_', '').replace('_', ' ')}
            </Text>
          </View>
        ))}
      </View>
    ));
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text>Loading trip updates...</Text>
        <Button title="Retry" onPress={fetchTimetable} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>❌ Error: {error}</Text>
        <Button title="Retry Fetch" onPress={fetchTimetable} />
      </View>
    );
  }

  return (
    <View style={styles.fullContainer}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>🚌 Real-time Trip Updates</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by stop name..."
          value={searchQuery}
          onChangeText={(text) => {
            setSearchQuery(text);
            setShowSuggestions(text.length > 0);
          }}
          onFocus={() => setShowSuggestions(searchQuery.length > 0)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        />
        {searchQuery && (
          <TouchableOpacity 
            style={styles.clearButton}
            onPress={() => {
              setSearchQuery('');
              setShowSuggestions(false);
            }}
          >
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {showSuggestions && filteredSuggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <FlatList
            data={filteredSuggestions}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.suggestionItem}
                onPress={() => handleSelectSuggestion(item)}
              >
                <Text style={styles.suggestionText}>{item}</Text>
              </TouchableOpacity>
            )}
            keyboardShouldPersistTaps="always"
          />
        </View>
      )}

      <View style={styles.filterContainer}>
        {renderTransportFilters()}
      </View>

      <Button title="Debug Fetch" onPress={fetchTimetable} color="#007AFF" />

      <FlatList
        data={filteredTimetable}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        ListEmptyComponent={
          <Text style={styles.noData}>
            {searchQuery 
              ? "No trip updates match your search criteria."
              : "No trip updates available for selected transports."}
          </Text>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  fullContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  headerContainer: {
    padding: 16,
    paddingBottom: 0,
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  searchContainer: {
    position: 'relative',
    margin: 16,
    marginBottom: 0,
  },
  searchInput: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    fontSize: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    paddingRight: 40,
  },
  clearButton: {
    position: 'absolute',
    right: 10,
    top: 15,
  },
  suggestionsContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 5,
    maxHeight: 200,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    zIndex: 1,
  },
  suggestionItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  suggestionText: {
    fontSize: 16,
    color: '#333',
  },
  filterContainer: {
    backgroundColor: 'white',
    padding: 15,
    margin: 16,
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  filterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
  },
  filterLabel: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  card: {
    backgroundColor: 'white',
    padding: 15,
    marginVertical: 8,
    marginHorizontal: 16,
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
    marginHorizontal: 16,
  },
  listContent: {
    paddingBottom: 16,
  },
});

export default Timetable;