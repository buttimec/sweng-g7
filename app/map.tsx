import { useLocationStore } from '@/store';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, Button } from 'react-native';
import MapView, { PROVIDER_DEFAULT, Region } from 'react-native-maps';

export default function MapPage() {
  const {
    userLongitude,
    userLatitude,
    destinationLatitude,
    destinationLongitude,
  } = useLocationStore();

  // State for the map region
  const [mapRegion, setMapRegion] = useState<Region | null>(null);

  useEffect(() => {
    if (userLatitude !== null && userLongitude !== null) {
      setMapRegion({
        latitude: userLatitude,
        longitude: userLongitude,
        latitudeDelta: 0.01, // Zoom level
        longitudeDelta: 0.01,
      });
    }
  }, [userLatitude, userLongitude]);


  // Manual trigger for debugging
  const fetchRoutes = () => {
    console.log("🛠 Manually fetching routes...");
    //fetchTimetable();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Map</Text>

      <TextInput style={styles.searchBar} placeholder="Search for a route" />
      <Button title="Fetch Routes" onPress={fetchRoutes}/>

      <View style={styles.mapContainer}>
        <MapView
          provider={PROVIDER_DEFAULT}
          style={styles.map}
          showsUserLocation={true}
          region={mapRegion || undefined} // Set initial region when available
        />
      </View>

      <ScrollView style={styles.routesList}>
        <Text style={styles.routeItem}>Route 1:</Text>
        <Text style={styles.routeItem}>Route 2:</Text>
        <Text style={styles.routeItem}>Route 3:</Text>
        <Text style={styles.routeItem}>Route 4:</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 10,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  searchBar: {
    width: '90%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    paddingLeft: 10,
    marginBottom: 20,
  },
  mapContainer: {
    width: '90%',
    height: 300,
    borderWidth: 2,
    borderColor: 'black',
    borderRadius: 10,
    marginBottom: 20,
  },
  map: {
    flex: 1,
    borderRadius: 10,
  },
  routesList: {
    width: '90%',
  },
  routeItem: {
    fontSize: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});