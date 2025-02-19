
import React, { useEffect } from 'react';
import * as Location from 'expo-location';
import { Text, View, Button, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';  // Use expo-router for navigation
import { useLocationStore } from "@/store";
import { useState } from 'react';

export default function Index() {
  const router = useRouter();
  const {setUserLocation, setDestinationLocation} = useLocationStore();
  const [hasPermissions, setHasPermissions] = useState(false);

  useEffect(() => {
    const requestLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
    
      if(status != 'granted'){
        setHasPermissions(false)
        return;
      };

      let location = await Location.getCurrentPositionAsync();

      const address = await Location.reverseGeocodeAsync({
        latitude: location.coords?.latitude!,
        longitude: location.coords?.longitude!,
      });

      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        address: '${address[0].name}, ${address[0].region}',
      });

    };

    requestLocation();
  }, [])


  return (
    <View style={styles.container}>
      <Text style={styles.header}>Welcome to TrinityTransit!</Text>
      <Text style={styles.subHeader}>Your Bus Timetabling App</Text>

      <Button
        title="View Timetable"
        onPress={() => router.push('/timetable')}
        color="#007BFF"
      />

      <Button
        title="View Map"
        onPress={() => router.push('/map')}  
        color="#28a745"  
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f4f4f4',
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
});
