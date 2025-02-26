import React, { useEffect, useState } from 'react';
import * as Location from 'expo-location';
import { Text, View, Button, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';  // Use expo-router for navigation
import { useLocationStore } from "@/store";

export default function Index() {
  const router = useRouter();
  const { setUserLocation, setDestinationLocation } = useLocationStore();
  const [hasPermissions, setHasPermissions] = useState(false);

  useEffect(() => {
    const requestLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
    
      if (status !== 'granted') {
        setHasPermissions(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync();

      const address = await Location.reverseGeocodeAsync({
        latitude: location.coords?.latitude,
        longitude: location.coords?.longitude,
      });

      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        address: '${address[0].name}, ${address[0].region}',
      });
    };

    requestLocation();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.header}>Welcome to TrinityTransit!</Text>
        <Text style={styles.subHeader}>Your Bus Timetabling App</Text>
      </View>
      <View style={styles.bottomNav}>
        <View style={styles.navButton}>
          <Button
            title="View Timetable"
            onPress={() => router.push('/timetable')}
            color="#007BFF"
          />
        </View>
        <View style={styles.navButton}>
          <Button
            title="View Map"
            onPress={() => router.push('/map')}
            color="#28a745"
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 16,
  },
  subHeader: {
    fontSize: 16,
    color: '#555',
    marginBottom: 20,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    elevation: 5, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  navButton: {
    flex: 1,
    marginHorizontal: 10,
  },
});
