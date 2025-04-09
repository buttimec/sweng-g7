import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BACKEND_URL } from '@/config';

export default function ProfileScreen() {
  const router = useRouter();

  // Real personal details from backend
  const [personalDetails, setPersonalDetails] = useState({
    name: '',
    email: ''
  });

  // Saved routes fetched from backend
  const [savedTrips, setSavedTrips] = useState([]);

  // Saved providers fetched from backend
  const [transportProviders, setTransportProviders] = useState([]);
  
  // Debug state
  const [showDebug, setShowDebug] = useState(false);

  // Fetch preferred providers from backend
  useEffect(() => {
    const fetchTransportProviders = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/favourites/1`);
        if (response.ok) {
          const data = await response.json();
          console.log("Transport providers data:", data);
          setTransportProviders(data);
        } else {
          console.warn(`Error fetching transport providers: ${response.status}`);
        }
      } catch (error) {
        console.error('Error fetching transport providers:', error.message);
      }
    };

    fetchTransportProviders();
  }, []);

  // Dummy profile image
  const [profileImage, setProfileImage] = useState('https://picsum.photos/200/?random&t=' + Date.now());

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/users/1`);
        console.log('Status:', response.status);

        if (!response.ok) {
          console.warn(`User not found or error: ${response.status}`);
          return; // Exit early
        }

        const data = await response.json();
        setPersonalDetails(data);
      } catch (error) {
        console.error('Error fetching user:', error.message);
      }
    };

    fetchUserDetails();
  }, []);

  // Fetch saved routes from backend
  useEffect(() => {
    const fetchSavedRoutes = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/FaveRoutes`);
        if (response.ok) {
          const data = await response.json();
          setSavedTrips(data);
        } else {
          console.warn(`Error fetching saved routes: ${response.status}`);
        }
      } catch (error) {
        console.error('Error fetching saved routes:', error.message);
      }
    };

    fetchSavedRoutes();
  }, []);

  const renderProviderName = (provider) => {
    if (provider.provider) {
      const { name, vehicleType } = provider.provider;
      return `${name} (${vehicleType})`;
    }
    return 'Unknown Provider';
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileHeader}>
        <Image source={{ uri: profileImage }} style={styles.profileImage} />
        <TouchableOpacity 
        onPress={() => setProfileImage('https://picsum.photos/200/?random&t=' + Date.now())}
        style={styles.editPhotoButton}>
          <Text style={styles.editPhotoButtonText}>Change Photo</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeader}>Personal Details</Text>
          <TouchableOpacity onPress={() => router.push('/edit/personal')}>
            <Ionicons name="create-outline" size={20} color="#007AFF" />
          </TouchableOpacity>
        </View>
        <Text style={styles.detailText}>Name: {personalDetails.name}</Text>
        <Text style={styles.detailText}>Email: {personalDetails.email}</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeader}>Saved Routes</Text>
          <TouchableOpacity onPress={() => router.push('/edit/savedTrips')}>
            <Ionicons name="create-outline" size={20} color="#007AFF" />
          </TouchableOpacity>
        </View>
        {savedTrips.map((trip) => (
          <View key={trip.id} style={styles.itemRow}>
            <Text style={styles.itemText}>{trip.name}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeader}>Preferred Transport Providers</Text>
          <TouchableOpacity onPress={() => router.push('/edit/transport')}>
            <Ionicons name="create-outline" size={20} color="#007AFF" />
          </TouchableOpacity>
        </View>
        {transportProviders.length > 0 ? (
          transportProviders.map((provider, index) => (
            <View key={index} style={styles.itemRow}>
              <Text style={styles.itemText}>{renderProviderName(provider)}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No preferred providers selected</Text>
        )}
      </View>
      
      {/* Debug Section - Toggle with button */}
      <View style={styles.debugToggleContainer}>
        <TouchableOpacity 
          style={styles.debugToggleButton} 
          onPress={() => setShowDebug(!showDebug)}>
          <Text style={styles.debugToggleText}>
            {showDebug ? "Hide Debug Info" : "Show Debug Info"}
          </Text>
        </TouchableOpacity>
      </View>
      
      {showDebug && (
        <View style={styles.debugSection}>
          <Text style={styles.debugHeader}>Transport Providers Debug:</Text>
          <Text style={styles.debugText}>Count: {transportProviders.length}</Text>
          <Text style={styles.debugText}>Raw Data:</Text>
          {transportProviders.map((provider, index) => (
            <View key={index} style={styles.debugItem}>
              <Text style={styles.debugItemText}>
                Item {index}: {JSON.stringify(provider)}
              </Text>
              <Text style={styles.debugItemType}>
                Type: {Array.isArray(provider) ? 'Array' : typeof provider}
              </Text>
              {Array.isArray(provider) && (
                <Text style={styles.debugItemDetail}>
                  Array values: [{provider.join(', ')}]
                </Text>
              )}
              {typeof provider === 'object' && provider !== null && !Array.isArray(provider) && (
                <Text style={styles.debugItemDetail}>
                  Keys: {Object.keys(provider).join(', ')}
                </Text>
              )}
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#ccc',
  },
  editPhotoButton: {
    marginTop: 10,
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  editPhotoButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  detailText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 6,
  },
  itemRow: {
    paddingVertical: 6,
  },
  itemText: {
    fontSize: 16,
    color: '#555',
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    fontStyle: 'italic',
  },
  // Debug styles
  debugToggleContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  debugToggleButton: {
    backgroundColor: '#6c757d',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  debugToggleText: {
    color: '#fff',
    fontWeight: '600',
  },
  debugSection: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  debugHeader: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
    color: '#333',
  },
  debugText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  debugItem: {
    backgroundColor: '#e3e3e3',
    padding: 8,
    borderRadius: 4,
    marginVertical: 4,
  },
  debugItemText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#333',
  },
  debugItemType: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  debugItemDetail: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
});