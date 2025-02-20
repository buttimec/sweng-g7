import { useLocationStore } from '@/store';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, Button } from 'react-native';
import MapView, { PROVIDER_DEFAULT, Region } from 'react-native-maps';

const BACKEND_URL = "https://d9e7-84-203-44-188.ngrok-free.app"; // ngrok url changes everytime

export default function MapPage() {
  const {
    userLongitude,
    userLatitude,
    destinationLongitude,
    destinationLatitude,
    destinationAddress,
    setDestinationLocation,
  } = useLocationStore();

  const [mapRegion, setMapRegion] = useState<Region | null>(null);
  const [destination, setDestination] = useState("");
  const [routes, setRoutes] = useState<any[]>([]);

  useEffect(() => {
    if (userLatitude !== null && userLongitude !== null) {
      setMapRegion({
        latitude: userLatitude,
        longitude: userLongitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
      console.log("User's coordinates set:", userLatitude, userLongitude); // Log user's coordinates
    }
  }, [userLatitude, userLongitude]);

  const fetchDestinationCoordinates = async () => {
    try {
      console.log("Fetching destination coordinates for:", destination);

      const response = await fetch(
        `${BACKEND_URL}/geocode?address=${encodeURIComponent(destination)}`
      );

      if (!response.ok) {
        console.error("Error fetching destination coordinates:", response.statusText);
        return false;
      }

      const data = await response.json();
      console.log("Destination coordinates:", data);

      if (data[0] && data[0].geometry && data[0].geometry.location) {
        const { lat, lng } = data[0].geometry.location;
        console.log("Fetched destination latitude and longitude:", lat, lng); // Log destination coordinates
        setDestinationLocation({
          latitude: lat,
          longitude: lng,
          address: destination,
        });
        console.log("Destination location set in store:", lat, lng);
        return true;
      } else {
        console.error("Destination coordinates not found");
        return false;
      }
    } catch (error) {
      console.error("Error fetching destination:", error);
      return false;
    }
  };

  const fetchRoutes = async () => {
    try {
      console.log("🛠 Fetching routes...");
      const success = await fetchDestinationCoordinates();
      if (!success) {
        console.log("Cannot fetch routes: Destination missing");
        return;
      }

      if (userLatitude && userLongitude && destinationLatitude && destinationLongitude) {
        console.log("Requesting routes from origin:", userLatitude, userLongitude, "to destination:", destinationLatitude, destinationLongitude); // Log route request data

        const response = await fetch(
          `${BACKEND_URL}/directions?originLat=${userLatitude}&originLng=${userLongitude}&destLat=${destinationLatitude}&destLng=${destinationLongitude}`
        );

        if (response.ok) {
          const data = await response.json();
          console.log("Routes fetched successfully:", JSON.stringify(data, null, 2));

          if (data.length > 0) {
            let allRoutes = []; // Array to store all routes instructions

            data.forEach((route, routeIndex) => {
              const steps = route.legs.flatMap((leg: any) => leg.steps);
              const routeInstructions = steps.map((step: any, index: number) => ({
                id: `${routeIndex}-${index}`,  // Make the id unique by adding the route index
                instruction: step.htmlInstructions || `Step ${index + 1} not available`,
              }));
              console.log(`📝 Route ${routeIndex + 1} instructions:`, routeInstructions);
              allRoutes = [...allRoutes, ...routeInstructions];  // Combine all route instructions
            });

            setRoutes(allRoutes); // Save all route instructions in state
          } else {
            console.error("No routes found");
          }
        } else {
          console.error("Error fetching routes:", response.statusText);
        }
      } else {
        console.log("Missing coordinates");
      }
    } catch (error) {
      console.error("Error fetching directions:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Map</Text>

      <TextInput
        style={styles.searchBar}
        placeholder="Enter destination"
        value={destination}
        onChangeText={setDestination}
      />

      <Button title="Fetch Routes" onPress={fetchRoutes} />

      <ScrollView style={styles.routesList}>
        {routes.length > 0 ? (
          routes.map((route, index) => (
            <Text key={route.id} style={styles.routeItem}>
              {route.instruction}
            </Text>
          ))
        ) : (
          <Text style={styles.noRoutes}>No routes available</Text>
        )}
      </ScrollView>

      <View style={styles.mapContainer}>
        <MapView
          provider={PROVIDER_DEFAULT}
          style={styles.map}
          showsUserLocation={true}
          region={mapRegion || undefined}
        />
      </View>
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
    marginTop: 10,
  },
  routeItem: {
    fontSize: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  noRoutes: {
    fontSize: 16,
    textAlign: 'center',
    paddingVertical: 10,
    color: 'gray',
  },
});
