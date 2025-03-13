import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MapView, { PROVIDER_DEFAULT, Marker, Region } from 'react-native-maps';
import { BACKEND_URL } from '@/config';
import { useLocationStore } from '@/store';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const CustomButton = ({ title, onPress }: { title: string; onPress: () => void }) => (
  <TouchableOpacity style={styles.button} onPress={onPress}>
    <Text style={styles.buttonText}>{title}</Text>
  </TouchableOpacity>
);

interface PersistedState {
  routes: any[];
  recentDestinations: string[];
  selectedRouteIndex: number | null;
}

export default function MapPage() {
  const router = useRouter();
  const { userLatitude, userLongitude, setDestinationLocation } = useLocationStore();

  const [mapRegion, setMapRegion] = useState<Region | null>(null);
  const [destination, setDestination] = useState("");
  const [routes, setRoutes] = useState<any[]>([]);
  const [recentDestinations, setRecentDestinations] = useState<string[]>([]);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState<number | null>(null);
  const [nearbyStops, setNearbyStops] = useState<any[]>([]);
  const [busStopsLoading, setBusStopsLoading] = useState<boolean>(false);
  const [isRoutePanelExpanded, setIsRoutePanelExpanded] = useState<boolean>(true);

  const persistState = async (state: PersistedState) => {
    try {
      await AsyncStorage.setItem('mapPageState', JSON.stringify(state));
    } catch (error) {
      console.error("Error saving state", error);
    }
  };

  const loadPersistedState = async () => {
    try {
      const storedState = await AsyncStorage.getItem('mapPageState');
      if (storedState) {
        const state: PersistedState = JSON.parse(storedState);
        setRoutes(state.routes);
        setRecentDestinations(state.recentDestinations);
        setSelectedRouteIndex(state.selectedRouteIndex);
      }
    } catch (error) {
      console.error("Error loading persisted state", error);
    }
  };

  useEffect(() => {
    loadPersistedState();
  }, []);

  useEffect(() => {
    persistState({ routes, recentDestinations, selectedRouteIndex });
  }, [routes, recentDestinations, selectedRouteIndex]);

  useEffect(() => {
    if (userLatitude && userLongitude) {
      setMapRegion({
        latitude: userLatitude,
        longitude: userLongitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
      console.log("User's coordinates set:", userLatitude, userLongitude);
    }
  }, [userLatitude, userLongitude]);

  const getDestinationCoordinates = async (
    addr: string
  ): Promise<{ lat: number; lng: number, placeId: string } | null> => {
    try {
      console.log("Geocoding address:", addr);
      const response = await fetch(
        `${BACKEND_URL}/geocode?address=${encodeURIComponent(addr)}`
      );
      if (!response.ok) {
        console.error("Geocoding error:", response.statusText);
        return null;
      }
      const data = await response.json();
      if (data[0] && data[0].geometry && data[0].geometry.location) {
        const { lat, lng } = data[0].geometry.location;
        const placeId = data[0].placeId;
        console.log("Coordinates for", addr, ":", lat, lng);
        return { lat, lng, placeId };
      } else {
        console.error("No coordinates found for", addr);
        return null;
      }
    } catch (error) {
      console.error("Error during geocoding:", error);
      return null;
    }
  };

  const fetchRoutesUsingCoords = async (coords: { lat: number; lng: number }) => {
    if (userLatitude && userLongitude) {
      const response = await fetch(
        `${BACKEND_URL}/directions?originLat=${userLatitude}&originLng=${userLongitude}&destLat=${coords.lat}&destLng=${coords.lng}`
      );
      if (response.ok) {
        const data = await response.json();
        console.log("Routes fetched:", JSON.stringify(data, null, 2));
        if (data.length > 0) {
          let allRoutes = [];
          data.forEach((route, routeIndex) => {
            const steps = route.legs.flatMap((leg: any) => leg.steps);
            const routeInstructions = steps.map((step: any, index: number) => ({
              id: `${routeIndex}-${index}`,
              instruction: step.htmlInstructions || `Step ${index + 1} not available`,
            }));
            allRoutes.push({ routeIndex, instructions: routeInstructions });
          });
          setRoutes(allRoutes);
          setSelectedRouteIndex(null);
        } else {
          console.error("No routes found");
        }
      } else {
        console.error("Error fetching routes:", response.statusText);
      }
    } else {
      console.log("User location missing");
    }
  };

  const handleSearch = async () => {
    if (!destination) return;
    const coords = await getDestinationCoordinates(destination);
    if (coords) {
      setDestinationLocation({
        latitude: coords.lat,
        longitude: coords.lng,
        address: destination,
      });
      if (!recentDestinations.includes(destination)) {
        setRecentDestinations([...recentDestinations, destination]);
      }
      await fetchRoutesUsingCoords(coords);
    }
  };

  const handleRecentPress = async (dest: string) => {
    setDestination(dest);
    const coords = await getDestinationCoordinates(dest);
    if (coords) {
      setDestinationLocation({
        latitude: coords.lat,
        longitude: coords.lng,
        address: dest,
      });
      await fetchRoutesUsingCoords(coords);
    }
  };

  const clearRecentDestinations = () => {
    setRecentDestinations([]);
  };

  const fetchNearbyBusStops = async () => {
    if (userLatitude && userLongitude) {
      setBusStopsLoading(true);
      try {
        const response = await fetch(
          `${BACKEND_URL}/getNearStops?lat=${userLatitude}&lng=${userLongitude}&radius=1000`
        );
        if (response.ok) {
          const data = await response.json();
          console.log("Nearby bus stops:", data);
          setNearbyStops(data);
        } else {
          console.error("Error fetching bus stops:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching bus stops:", error);
      } finally {
        setBusStopsLoading(false);
      }
    } else {
      console.log("User location is not set.");
    }
  };

  return (
    <View style={styles.container}>
      

      <View style={styles.mapContainer}>
        <MapView
          provider={PROVIDER_DEFAULT}
          style={styles.map}
          showsUserLocation={true}
          region={mapRegion || undefined}
        >
          {nearbyStops.map((stop: any, index: number) => {
            const latitude = stop.geometry?.location?.lat;
            const longitude = stop.geometry?.location?.lng;
            if (latitude && longitude) {
              return (
                <Marker
                  key={index}
                  coordinate={{ latitude, longitude }}
                  title={stop.name}
                  description={stop.vicinity || ""}
                />
              );
            }
            return null;
          })}
        </MapView>
      </View>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Enter destination"
            value={destination}
            onChangeText={setDestination}
          />
          <CustomButton title="Fetch Routes" onPress={handleSearch} />
          <CustomButton title="Find Nearby Bus Stops" onPress={fetchNearbyBusStops} />
        </View>
        {recentDestinations.length > 0 && (
          <View style={styles.recentContainer}>
            <View style={styles.recentHeaderContainer}>
              <Text style={styles.sectionHeader}>Recent Searches</Text>
              <TouchableOpacity style={styles.clearButton} onPress={clearRecentDestinations}>
                <Text style={styles.clearButtonText}>Clear</Text>
              </TouchableOpacity>
            </View>
            {recentDestinations.map((dest, index) => (
              <TouchableOpacity key={index} onPress={() => handleRecentPress(dest)}>
                <Text style={styles.recentItem}>{dest}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        {routes.length > 0 && (
          <View style={styles.sectionContainer}>
            <View style={styles.routeHeaderContainer}>
              <Text style={styles.sectionHeader}>
                {selectedRouteIndex === null ? "Select a Route" : "Selected Route"}
              </Text>
              <TouchableOpacity onPress={() => setIsRoutePanelExpanded(prev => !prev)}>
                <Text style={styles.dropdownArrow}>
                  {isRoutePanelExpanded ? "▲" : "▼"}
                </Text>
              </TouchableOpacity>
            </View>
            {isRoutePanelExpanded && (
              selectedRouteIndex === null ? (
                routes.map((routeSection, sectionIndex) => (
                  <TouchableOpacity
                    key={sectionIndex}
                    style={styles.routeSummary}
                    onPress={() => setSelectedRouteIndex(sectionIndex)}
                  >
                    <Text style={styles.routeTitle}>Route {routeSection.routeIndex + 1}</Text>
                    <Text style={styles.routeSummaryText}>
                      {routeSection.instructions[0]?.instruction.slice(0, 50)}...
                    </Text>
                  </TouchableOpacity>
                ))
              ) : (
                <View>
                  <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => setSelectedRouteIndex(null)}
                  >
                    <Text style={styles.backButtonText}>Back to Routes</Text>
                  </TouchableOpacity>
                  <View style={styles.routeDetail}>
                    <Text style={styles.routeTitle}>
                      Route {routes[selectedRouteIndex].routeIndex + 1} Details
                    </Text>
                    {routes[selectedRouteIndex].instructions.map((instruction: any) => (
                      <Text key={instruction.id} style={styles.routeItem}>
                        {instruction.instruction}
                      </Text>
                    ))}
                  </View>
                </View>
              )
            )}
          </View>
        )}
        {busStopsLoading ? (
          <ActivityIndicator size="small" color="#007AFF" />
        ) : (
          nearbyStops.length > 0 && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionHeader}>Nearby Bus Stops</Text>
              {nearbyStops.map((stop: any, index: number) => (
                <View key={index} style={styles.busStopRow}>
                  <Image source={{ uri: stop.icon }} style={styles.busStopIcon} />
                  <Text style={styles.busStopText}>
                    {stop.name} {stop.vicinity ? `- ${stop.vicinity}` : ""}
                  </Text>
                </View>
              ))}
            </View>
          )
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 5,
    backgroundColor: '#f8f9fa',
  },
  backArrow: {
    
  },
  mapContainer: {
    marginHorizontal: 10,
    marginTop: 5,
    borderWidth: 2,
    borderColor: '#007AFF',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    height: 250,
  },
  map: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  searchInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  recentContainer: {
    marginBottom: 20,
  },
  recentHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  clearButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 4,
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 12,
  },
  recentItem: {
    backgroundColor: '#e9ecef',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
    fontSize: 16,
    color: '#007AFF',
  },
  sectionContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 2,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  routeHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  dropdownArrow: {
    fontSize: 20,
    color: '#007AFF',
  },
  routeSummary: {
    padding: 10,
    backgroundColor: '#f1f3f5',
    borderRadius: 8,
    marginBottom: 10,
  },
  routeSummaryText: {
    fontSize: 14,
    color: '#555',
  },
  backButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 15,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  routeDetail: {
    backgroundColor: '#f1f3f5',
    borderRadius: 8,
    padding: 10,
  },
  routeTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
    color: '#007AFF',
  },
  routeItem: {
    fontSize: 15,
    color: '#555',
    paddingVertical: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: '#ccc',
  },
  busStopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  busStopIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  busStopText: {
    fontSize: 15,
    color: '#555',
  },
});

export default MapPage;
