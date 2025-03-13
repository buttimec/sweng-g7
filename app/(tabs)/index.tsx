import React, { useEffect, useState } from 'react';
import * as Location from 'expo-location';
import { Text, View, StyleSheet, ScrollView } from 'react-native';
import { useLocationStore } from "@/store";

export default function Index() {
  const { setUserLocation } = useLocationStore();
  const [hasPermissions, setHasPermissions] = useState(false);

  // Sample data for nearby departures
  const [departures, setDepartures] = useState([
    { id: '1', route: 'Route 1', departureTime: '12:05 PM' },
    { id: '2', route: 'Route 2', departureTime: '12:15 PM' },
    { id: '3', route: 'Route 3', departureTime: '12:30 PM' },
  ]);

  // Sample data for updates
  const [updates, setUpdates] = useState([
    { id: '1', message: 'Service disruption on Route 2 until 1:00 PM.' },
    { id: '2', message: 'New bus service added on Route 5.' },
  ]);

  useEffect(() => {
    const requestLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        setHasPermissions(false);
        return;
      }

      // Permission granted
      setHasPermissions(true);
      let location = await Location.getCurrentPositionAsync();

      // Reverse geocode to get an address string
      const address = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        address: `${address[0].name}, ${address[0].region}`,
      });
    };

    requestLocation();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.welcomeSection}>
        <Text style={styles.header}>Welcome to TrinityTransit!</Text>
        <Text style={styles.subHeader}>Your Transport Timetabling App</Text>
        {!hasPermissions && (
          <Text style={styles.permissionWarning}>
            Location permissions not granted.
          </Text>
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
        <Text style={styles.cardHeader}>Updates</Text>
        {updates.map((update) => (
          <View key={update.id} style={styles.updateItem}>
            <Text style={styles.updateText}>{update.message}</Text>
          </View>
        ))}
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
  },
  subHeader: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
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
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // Android shadow
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
  updateItem: {
    marginBottom: 8,
  },
  updateText: {
    fontSize: 16,
    color: '#333',
  },
});
