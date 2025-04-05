import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MapView, { PROVIDER_DEFAULT, Marker, Region } from 'react-native-maps';
import { BACKEND_URL } from '@/config';
import { useLocationStore } from '@/store';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useApiCacheStore } from '@/store/apiCacheStore';

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
  const { nearbyBuses: cachedNearbyBuses, nearbyBusesTimestamp, setNearbyBuses: cacheNearbyBuses } = useApiCacheStore();

  const [mapRegion, setMapRegion] = useState<Region | null>(null);
  const [destination, setDestination] = useState("");
  const [routes, setRoutes] = useState<any[]>([]);
  const [recentDestinations, setRecentDestinations] = useState<string[]>([]);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState<number | null>(null);
  const [nearbyStops, setNearbyStops] = useState<any[]>([]);
  const [busStopsLoading, setBusStopsLoading] = useState<boolean>(false);
  const [isRoutePanelExpanded, setIsRoutePanelExpanded] = useState<boolean>(true);
  const [nearbyBuses, setNearbyBuses] = useState<any[]>([]);
  const [busesLoading, setBusesLoading] = useState<boolean>(false);
  const [showBuses, setShowBuses] = useState<boolean>(false);
  const [selectedBusStops, setSelectedBusStops] = useState<Set<string>>(new Set());
  const [favouriteStops, setFavouriteStops] = useState<any[]>([]);
  const [selectedBuses, setSelectedBuses] = useState<Set<string>>(new Set());
  const [savedBuses, setSavedBuses] = useState<any[]>([]);
  const [isNearbyStopsExpanded, setIsNearbyStopsExpanded] = useState<boolean>(true);
  const [isNearbyBusesExpanded, setIsNearbyBusesExpanded] = useState<boolean>(true);
  const [isSavedBusesExpanded, setIsSavedBusesExpanded] = useState<boolean>(true);
  const [savedRoutes, setSavedRoutes] = useState<any[]>([]);
  const [isFavouriteStopsExpanded, setIsFavouriteStopsExpanded] = useState<boolean>(true);
  const [selectedFavouriteStop, setSelectedFavouriteStop] = useState<{
    latitude: number;
    longitude: number;
    name: string;
  } | null>(null);

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

  const fetchFavouriteStops = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/busstops`);
      if (res.ok) {
        const data = await res.json();
        setFavouriteStops(data);
      }
    } catch (err) {
      console.error("Failed to fetch saved bus stops:", err);
    }
  };

  const fetchSavedBuses = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/buses`);
      if (res.ok) {
        const data = await res.json();
        console.log("Saved buses response:", data);
        setSavedBuses(data);
      } else {
        console.error("Failed to fetch saved buses:", res.statusText);
      }
    } catch (err) {
      console.error("Error fetching saved buses:", err);
    }
  };

  const fetchSavedRoutes = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/FaveRoutes`);
      if (res.ok) {
        const data = await res.json();
        setSavedRoutes(data);
      } else {
        console.error("Error fetching saved routes:", res.statusText);
      }
    } catch (error) {
      console.error("Error fetching saved routes:", error);
    }
  };

  useEffect(() => {
    loadPersistedState();
    fetchFavouriteStops();
    fetchSavedBuses();
    fetchSavedRoutes();
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
      let query = addr;
      
      console.log("Geocoding address:", query);
      const response = await fetch(
        `${BACKEND_URL}/geocode?address=${encodeURIComponent(query)}`
      );
      if (!response.ok) {
        console.error("Geocoding error:", response.statusText);
        return null;
      }
      const data = await response.json();
      if (data[0] && data[0].geometry && data[0].geometry.location) {
        const { lat, lng } = data[0].geometry.location;
        const placeId = data[0].placeId;
        console.log("Coordinates for", query, ":", lat, lng);
        return { lat, lng, placeId };
      } else {
        console.error("No coordinates found for", query);
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

  const handleSavedBusStopPress = (stop: any) => {
    if (stop.location) {
      const parts = stop.location.split(',');
      const lat = parseFloat(parts[0]);
      const lng = parseFloat(parts[1]);
      if (!isNaN(lat) && !isNaN(lng)) {
        setSelectedFavouriteStop({ latitude: lat, longitude: lng, name: stop.name });
        setMapRegion({
          latitude: lat,
          longitude: lng,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      }
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

  const fetchNearbyBuses = async (attempt = 1) => {
    if (userLatitude && userLongitude) {
      const now = Date.now();
      const cacheTTL = 60000; // Cache valid for 60 seconds
      if (cachedNearbyBuses && nearbyBusesTimestamp && (now - nearbyBusesTimestamp < cacheTTL)) {
        console.log("Using cached nearby buses");
        setNearbyBuses(cachedNearbyBuses);
        return;
      }
      setBusesLoading(true);
      console.log(`Fetching nearby buses from: ${BACKEND_URL}/getNearbyBuses?lat=${userLatitude}&lng=${userLongitude}&radius=50`);
      try {
        const response = await fetch(
          `${BACKEND_URL}/getNearbyBuses?lat=${userLatitude}&lng=${userLongitude}&radius=50`
        );
        if (response.ok) {
          const data = await response.json();
          console.log("Nearby buses:", data);
          const limitedBuses = data.slice(0, 20); // show max 20
          setNearbyBuses(limitedBuses);
          cacheNearbyBuses(limitedBuses, now);
        } else {
          console.error("Error fetching nearby buses:", response.status, response.statusText);
          if (attempt < 3) {
            console.log(`Retrying fetchNearbyBuses, attempt ${attempt + 1}...`);
            setTimeout(() => fetchNearbyBuses(attempt + 1), 2000);
          }
        }
      } catch (error: any) {
        console.error("Error fetching nearby buses:", error, JSON.stringify(error));
        if (attempt < 3) {
          console.log(`Retrying fetchNearbyBuses, attempt ${attempt + 1}...`);
          setTimeout(() => fetchNearbyBuses(attempt + 1), 2000);
        }
      } finally {
        setBusesLoading(false);
      }
    } else {
      console.log("User location is not set.");
    }
  };

  const saveSelectedBuses = async () => {
    const selected = nearbyBuses.filter(bus => selectedBuses.has(bus.vehicleId));
    try {
      const response = await fetch(`${BACKEND_URL}/api/buses/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selected.map(bus => ({
          name: bus.routeLongName,
          route: bus.routeShortName,
        }))),
      });
      if (response.ok) {
        alert("Buses saved!");
        setSelectedBuses(new Set());
        fetchSavedBuses();
      } else {
        alert("Failed to save buses.");
      }
    } catch (err) {
      console.error("Error saving buses:", err);
    }
  };

  const saveSelectedBusStops = async () => {
    const selected = nearbyStops.filter(stop => selectedBusStops.has(stop.name));
    try {
      const response = await fetch(`${BACKEND_URL}/api/busstops/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selected.map(s => ({
          name: s.name,
          location: `${s.geometry.location.lat},${s.geometry.location.lng}`
        }))),
      });
      if (response.ok) {
        alert("Bus stops saved!");
        setSelectedBusStops(new Set());
        fetchFavouriteStops();
      } else {
        alert("Failed to save stops.");
      }
    } catch (err) {
      console.error("Save error:", err);
    }
  };

  const removeBusStop = async (name: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/busstops/by-name/${encodeURIComponent(name)}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setFavouriteStops(prev => prev.filter(stop => stop.name !== name));
      } else {
        console.error("Failed to delete stop, status:", response.status);
        const errorText = await response.text();
        console.error("Error message:", errorText);
      }
    } catch (err) {
      console.error("Error deleting stop:", err);
    }
  };

  const removeBus = async (id: number) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/buses/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setSavedBuses(prev => prev.filter(bus => bus.id !== id));
      } else {
        console.error("Failed to delete bus, status:", response.status);
        const errorText = await response.text();
        console.error("Error message:", errorText);
      }
    } catch (err) {
      console.error("Error deleting bus:", err);
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
                  key={`stop-${index}`}
                  coordinate={{ latitude, longitude }}
                  title={stop.name}
                  description={stop.vicinity || ""}
                />
              );
            }
            return null;
          })}
          {showBuses && nearbyBuses.map((bus: any, index: number) => {
            if (bus.latitude && bus.longitude) {
              return (
                <Marker
                  key={`bus-${index}`}
                  coordinate={{ latitude: bus.latitude, longitude: bus.longitude }}
                  title={bus.routeShortName}
                  description={bus.destination ? `Destination: ${bus.destination}` : "Nearby Bus"}
                >
                  <Image
                    source={require('../../assets/images/simple_bus_icon.png')}
                    style={{ width: 10, height: 10 }}
                    resizeMode="contain"
                  />
                </Marker>
              );
            }
            return null;
          })}
          {selectedFavouriteStop && (
            <Marker
              coordinate={{
                latitude: selectedFavouriteStop.latitude,
                longitude: selectedFavouriteStop.longitude,
              }}
              title={selectedFavouriteStop.name}
              description="Saved Bus Stop"
            />
          )}
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
          <CustomButton
            title={showBuses ? "Hide Nearby Buses" : "Show Nearby Buses"}
            onPress={async () => {
              if (!showBuses) await fetchNearbyBuses();
              setShowBuses(!showBuses);
            }}
          />
        </View>
        {savedRoutes.length > 0 && (
          <View style={styles.sectionContainer}>
            <View style={styles.headerRow}>
              <Text style={styles.sectionHeader}>Saved Routes</Text>
            </View>
            {savedRoutes.map((route: any, index: number) => (
              <TouchableOpacity
                key={index}
                style={styles.savedRouteItem}
                onPress={() => handleRecentPress(route.name)}
              >
                <Text style={styles.savedRouteText}>{route.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

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
        {busesLoading ? (
          <ActivityIndicator size="small" color="#007AFF" />
        ) : (
          showBuses && nearbyBuses.length > 0 && (
            <View style={styles.sectionContainer}>
              <View style={styles.headerRow}>
                <Text style={styles.sectionHeader}>Nearby Buses</Text>
                <TouchableOpacity onPress={() => setIsNearbyBusesExpanded(prev => !prev)}>
                  <Text style={styles.dropdownArrow}>
                    {isNearbyBusesExpanded ? "▲" : "▼"}
                  </Text>
                </TouchableOpacity>
              </View>
              {isNearbyBusesExpanded && (
                <>
                  {nearbyBuses.map((bus: any, index: number) => (
                    <View key={index} style={styles.busRow}>
                      <TouchableOpacity
                        style={styles.checkbox}
                        onPress={() => {
                          setSelectedBuses(prev => {
                            const newSet = new Set(prev);
                            if (newSet.has(bus.vehicleId)) newSet.delete(bus.vehicleId);
                            else newSet.add(bus.vehicleId);
                            return newSet;
                          });
                        }}
                      >
                        <Ionicons
                          name={selectedBuses.has(bus.vehicleId) ? "checkbox" : "square-outline"}
                          size={24}
                          color="#007AFF"
                        />
                      </TouchableOpacity>
                      <Text style={styles.busText}>
                        {bus.routeShortName} - {bus.routeLongName}
                      </Text>
                    </View>
                  ))}
                  <CustomButton title="Save Selected Buses" onPress={saveSelectedBuses} />
                </>
              )}
            </View>
          )
        )}
        {busStopsLoading ? (
          <ActivityIndicator size="small" color="#007AFF" />
        ) : (
          nearbyStops.length > 0 && (
            <View style={styles.sectionContainer}>
              <View style={styles.headerRow}>
                <Text style={styles.sectionHeader}>Nearby Bus Stops</Text>
                <TouchableOpacity onPress={() => setIsNearbyStopsExpanded(prev => !prev)}>
                  <Text style={styles.dropdownArrow}>
                    {isNearbyStopsExpanded ? "▲" : "▼"}
                  </Text>
                </TouchableOpacity>
              </View>
              {isNearbyStopsExpanded && (
                <>
                  {nearbyStops.map((stop: any, index: number) => (
                    <View key={index} style={styles.busStopRow}>
                      <Image source={{ uri: stop.icon }} style={styles.busStopIcon} />
                      <Text style={styles.busStopText}>
                        {stop.name} {stop.vicinity ? `- ${stop.vicinity}` : ""}
                      </Text>
                      <TouchableOpacity
                        style={styles.checkbox}
                        onPress={() => {
                          setSelectedBusStops(prev => {
                            const newSet = new Set(prev);
                            if (newSet.has(stop.name)) newSet.delete(stop.name);
                            else newSet.add(stop.name);
                            return newSet;
                          });
                        }}
                      >
                        <Ionicons
                          name={selectedBusStops.has(stop.name) ? "checkbox" : "square-outline"}
                          size={24}
                          color="#007AFF"
                        />
                      </TouchableOpacity>
                    </View>
                  ))}
                  <CustomButton title="Save Selected Stops" onPress={saveSelectedBusStops} />
                </>
              )}
            </View>
          )
        )}
        {favouriteStops.length > 0 && (
          <View style={styles.sectionContainer}>
            <View style={styles.headerRow}>
              <Text style={styles.sectionHeader}>Saved Bus Stops</Text>
              <TouchableOpacity onPress={() => setIsFavouriteStopsExpanded(prev => !prev)}>
                <Text style={styles.dropdownArrow}>
                  {isFavouriteStopsExpanded ? "▲" : "▼"}
                </Text>
              </TouchableOpacity>
            </View>
            {isFavouriteStopsExpanded && favouriteStops.map((stop: any, index: number) => (
              <TouchableOpacity key={index} onPress={() => handleSavedBusStopPress(stop)}>
                <View style={styles.busStopRow}>
                  <Ionicons name="star" size={20} color="#f5b301" style={{ marginRight: 6 }} />
                  <Text style={styles.busStopText}>
                    {stop.name} - {stop.location}
                  </Text>
                  <TouchableOpacity onPress={() => removeBusStop(stop.name)}>
                    <Ionicons name="trash" size={20} color="red" style={{ marginLeft: 10 }} />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
        {savedBuses.length > 0 && (
          <View style={styles.sectionContainer}>
            <View style={styles.headerRow}>
              <Text style={styles.sectionHeader}>Saved Buses</Text>
              <TouchableOpacity onPress={() => setIsSavedBusesExpanded(prev => !prev)}>
                <Text style={styles.dropdownArrow}>
                  {isSavedBusesExpanded ? "▲" : "▼"}
                </Text>
              </TouchableOpacity>
            </View>
            {isSavedBusesExpanded && savedBuses.map((bus: any, index: number) => (
              <View key={index} style={styles.busRow}>
                <Ionicons name="bus" size={20} color="#f5b301" style={{ marginRight: 6 }} />
                <Text style={styles.busText}>
                  {bus.route} - {bus.name}
                </Text>
                <TouchableOpacity onPress={() => removeBus(bus.id)}>
                  <Ionicons name="trash" size={20} color="red" style={{ marginLeft: 10 }} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
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
  busRow: {
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  busText: {
    fontSize: 16,
    color: '#555',
  },
  checkbox: {
    marginLeft: 10,
  },
  savedRouteItem: {
    backgroundColor: '#e9ecef',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  savedRouteText: {
    fontSize: 16,
    color: '#007AFF',
  },
});

export default MapPage;
