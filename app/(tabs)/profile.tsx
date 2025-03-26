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

  // Dummy saved trips
  const [savedTrips] = useState([
    { id: 'trip1', title: 'Trip to Dublin', date: '2023-10-20' },
    { id: 'trip2', title: 'Trip to Cork', date: '2023-11-05' },
  ]);

  // Dummy preferred transport providers
  const [transportProviders] = useState([
    { id: 'prov1', name: 'Provider A' },
    { id: 'prov2', name: 'Provider B' },
  ]);

  // Dummy profile image
  const [profileImage] = useState('https://via.placeholder.com/150');

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        console.log("Fetching user from:", `${BACKEND_URL}/api/users/1`);
        const response = await fetch(`${BACKEND_URL}/api/users/1`);
        const data = await response.json();
        setPersonalDetails(data);
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    fetchUserDetails();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileHeader}>
        <Image source={{ uri: profileImage }} style={styles.profileImage} />
        <TouchableOpacity style={styles.editPhotoButton}>
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
          <Text style={styles.sectionHeader}>Saved Trips</Text>
          <TouchableOpacity onPress={() => router.push('/edit/savedTrips')}>
            <Ionicons name="create-outline" size={20} color="#007AFF" />
          </TouchableOpacity>
        </View>
        {savedTrips.map((trip) => (
          <View key={trip.id} style={styles.itemRow}>
            <Text style={styles.itemText}>
              {trip.title} - {trip.date}
            </Text>
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
