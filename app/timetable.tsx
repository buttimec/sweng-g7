import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl, Button } from 'react-native';

// API Configuration
const API_KEY = '9b70ea23a4a94ba68a7ebba3fadcd818';
const API_URL = 'https://api.nationaltransport.ie/gtfsr/v2/Vehicles?format=json';

export default function Timetable() {
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  console.log("🟢 Timetable component is mounting...");

  const fetchTimetable = useCallback(async () => {
  console.log("🚀 Fetching real-time bus timetable...");
  setLoading(true);

  try {
    const response = await fetch(API_URL, {
      headers: {
        'x-api-key': API_KEY,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
	"Access-Control-Allow-Origin": "*",
      },
    });

    console.log("📡 Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();

    if (!data?.entity) {
      throw new Error("Invalid API response format - missing 'entity'");
    }

    const formattedData = data.entity.map((entry, index) => ({
      bus: entry.vehicle?.vehicle?.label || `Bus ${index + 1}`,
      time: entry.vehicle?.timestamp
        ? new Date(entry.vehicle.timestamp * 1000).toLocaleTimeString()
        : "N/A",
      route: entry.vehicle?.trip?.route_id || "Unknown",
    }));

    console.log("✅ Successfully retrieved bus data", formattedData);
    setTimetable(formattedData);
    setError(null);
  } catch (err) {
    console.error("❌ Fetch error:", err);

    if (err instanceof TypeError) {
      console.error("⚠️ Possible network issue or CORS restriction.");
      setError(`Network error or CORS issue: ${err.message}`);
    } else {
      setError(`❌ Fetch error: ${err.message}`);
    }
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
}, []);


  // useEffect to fetch timetable on mount
  useEffect(() => {
    fetchTimetable();
  }, []);

  // Pull-to-refresh functionality
  const onRefresh = () => {
    console.log("🔄 Refreshing bus timetable...");
    setRefreshing(true);
    fetchTimetable();
  };

  // Manual trigger for debugging
  const debugFetch = () => {
    console.log("🛠 Manually fetching bus timetable...");
    fetchTimetable();
  };

  // Show loading indicator
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading bus timetable...</Text>
        <Button title="Retry" onPress={debugFetch} />
      </View>
    );
  }

  // Show error message if fetching fails
  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>❌ Error: {error}</Text>
        <Button title="Retry Fetch" onPress={fetchTimetable} />
      </View>
    );
  }

  // Render the timetable
  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={styles.header}>🚌 Real-time Bus Schedule</Text>
      <Button title="Debug Fetch" onPress={debugFetch} />
      {timetable.length > 0 ? (
        timetable.map((item, index) => (
          <View key={index} style={styles.row}>
            <Text style={styles.busText}>{item.bus} ({item.route})</Text>
            <Text style={styles.timeText}>{item.time}</Text>
          </View>
        ))
      ) : (
        <Text style={styles.noData}>No bus data available.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  busText: {
    fontSize: 16,
    color: '#333',
  },
  timeText: {
    fontSize: 16,
    color: '#333',
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
  },
  noData: {
    textAlign: 'center',
    fontSize: 16,
    color: '#555',
  },
});
