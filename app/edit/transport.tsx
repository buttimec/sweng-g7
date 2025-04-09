import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { BACKEND_URL } from '@/config';

export default function EditTransport() {
  const router = useRouter();
  const [providers, setProviders] = useState([]);
  const [favProviders, setFavProviders] = useState([]);
  const [newProvider, setNewProvider] = useState('');

  // On mount, fetch the favourite providers from the backend
  useEffect(() => {
    const loadAllProviders = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/providers`);
        const data = await res.json();
        setProviders(data);
      } catch (error) {
        console.error('Error fetching transport providers:', error);
      }
      try {
        const res = await fetch(`${BACKEND_URL}/api/favourites/1`);
        const data = await res.json();
        setFavProviders(data);
      } catch (error) {
        console.error('Error fetching favourite providers:', error);
      }
    };

    loadAllProviders();
  }, []);

  // Function to check if a provider is favorited
  const isProviderFavorited = (providerId) => {
    return favProviders.some(fav => 
      (Array.isArray(fav) && fav[1] === providerId) || 
      (fav.providerId === providerId)
    );
  };

  // Handle adding or removing a provider from favorites
  const handleAddProvider = async(provider) => {
    if (isProviderFavorited(provider.id)) {
      try {
        await fetch(`${BACKEND_URL}/api/favourites/delete?userId=1&providerId=${provider.id}`, {
          method: 'DELETE',
        });
        // Remove from favProviders
        setFavProviders(prev => prev.filter(p => 
          !(Array.isArray(p) && p[1] === provider.id) && 
          !(p.providerId === provider.id)
        ));
      } catch (error) {
        console.error('Error unfavoriting provider:', error);
      }
    } else {
      try {
        await fetch(`${BACKEND_URL}/api/favourites/add?userId=1&providerId=${provider.id}`, {
          method: 'POST',
        });
        // Add to favProviders
        setFavProviders(prev => [...prev, [1, provider.id]]);
      } catch (error) {
        console.error('Error favoriting provider:', error);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Edit Preferred Transport Providers</Text>
      <FlatList 
        data={providers}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.providerItem}>
            <Text style={styles.providerText}>{item.name}</Text>
            <TouchableOpacity 
              onPress={() => handleAddProvider(item)} 
              style={[
                styles.favButton,
                isProviderFavorited(item.id) && styles.favButtonActive
              ]}
            >
              <Text style={styles.favButtonText}>
                {isProviderFavorited(item.id) ? 'Favorited' : 'Favorite'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f8f9fa', 
    padding: 16 
  },
  header: { 
    fontSize: 26, 
    fontWeight: '700', 
    marginBottom: 20, 
    textAlign: 'center', 
    color: '#333' 
  },
  providerItem: { 
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  providerText: { 
    fontSize: 16, 
    color: '#555' 
  },
  input: { 
    backgroundColor: '#fff', 
    borderWidth: 1, 
    borderColor: '#ddd', 
    borderRadius: 8, 
    paddingHorizontal: 15, 
    paddingVertical: 10, 
    fontSize: 16, 
    marginVertical: 15 
  },
  addButton: { 
    backgroundColor: '#28a745', 
    paddingVertical: 12, 
    paddingHorizontal: 20, 
    borderRadius: 8, 
    alignItems: 'center', 
    marginBottom: 10 
  },
  button: { 
    backgroundColor: '#007AFF', 
    paddingVertical: 12, 
    paddingHorizontal: 20, 
    borderRadius: 8, 
    alignItems: 'center' 
  },
  buttonFav: { 
    backgroundColor: '#FDD017', 
    paddingVertical: 12, 
    paddingHorizontal: 20, 
    borderRadius: 8, 
    alignItems: 'center' 
  },
  buttonText: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: '600' 
  },
  favButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  favButtonActive: {
    backgroundColor: '#FDD017', // Yellow color for favorited items
  },
  favButtonText: {
    color: '#fff',
    fontSize: 14,
  }
});