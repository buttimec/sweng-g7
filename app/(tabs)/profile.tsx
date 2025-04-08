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

  const [savedTrips, setSavedTrips] = useState([]);

  // Saved providers fetched from backend
  const [transportProviders, setTransportProviders] = useState([]);
 
  // Fetch preferred providers from backend
  useEffect(() => {
    const fetchTransportProviders = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/favourites`);
        if (response.ok) {
          const data = await response.json();
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
        {transportProviders.map((provider) => (
          <View key={provider.id} style={styles.itemRow}>
            <Text style={styles.itemText}>{provider.name}</Text>
          </View>
        ))}
      </View>
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
});
