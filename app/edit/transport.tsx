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
        console.log("All providers:", data);
      } catch (error) {
        console.error('Error fetching transport providers:', error);
      }
      try {
        const res = await fetch(`${BACKEND_URL}/api/favourites/1`);
        const data = await res.json();
        setFavProviders(data);
        console.log("Favorite providers data:", data);
      } catch (error) {
        console.error('Error fetching favourite providers:', error);
      }
    };

    loadAllProviders();
  }, []);

  // Function to check if a provider is favorited
  const isProviderFavorited = (providerId) => {
    console.log(`Checking if provider ${providerId} is favorited among:`, favProviders);
    
    // Check different possible formats of favProviders data
    const isFavorited = favProviders.some(fav => {
      if (Array.isArray(fav)) {
        return fav[1] === providerId;
      } else if (fav.providerId) {
        return fav.providerId === providerId;
      } else if (fav.id) {
        return fav.id === providerId;
      }
      return false;
    });
    
    console.log(`Provider ${providerId} is favorited: ${isFavorited}`);
    return isFavorited;
  };

  // Handle adding or removing a provider from favorites
  const handleAddProvider = async(provider) => {
    const isCurrentlyFavorited = isProviderFavorited(provider.id);
    console.log(`About to ${isCurrentlyFavorited ? 'unfavorite' : 'favorite'} provider:`, provider);
    
    if (isCurrentlyFavorited) {
      try {
        await fetch(`${BACKEND_URL}/api/favourites/delete?userId=1&providerId=${provider.id}`, {
          method: 'DELETE',
        });
        console.log(`Removed provider ${provider.id} from favorites`);
        
        // Remove from favProviders
        setFavProviders(prev => {
          const updated = prev.filter(p => {
            if (Array.isArray(p)) {
              return p[1] !== provider.id;
            } else if (p.providerId) {
              return p.providerId !== provider.id;
            } else if (p.id) {
              return p.id !== provider.id;
            }
            return true;
          });
          console.log("Updated favorites after removal:", updated);
          return updated;
        });
      } catch (error) {
        console.error('Error unfavoriting provider:', error);
      }
    } else {
      try {
        const response = await fetch(`${BACKEND_URL}/api/favourites/add?userId=1&providerId=${provider.id}`, {
          method: 'POST',
        });
        const result = await response.json();
        console.log(`Added provider ${provider.id} to favorites. Response:`, result);
        
        // Add to favProviders - adjust this based on your actual response format
        setFavProviders(prev => {
          // This assumes your backend returns the newly created favorite or the updated list
          // Adjust based on what your API actually returns
          const updatedList = [...prev, result.newFavorite || [1, provider.id]];
          console.log("Updated favorites after addition:", updatedList);
          return updatedList;
        });
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
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
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
      
      {/* Debug view to show current state */}
      <View style={styles.debugContainer}>
        <Text style={styles.debugHeader}>Debug Info:</Text>
        <Text>Favorite providers count: {favProviders.length}</Text>
        <Text>Provider IDs: {providers.map(p => p.id).join(', ')}</Text>
      </View>
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
  },
  debugContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  debugHeader: {
    fontWeight: 'bold',
    marginBottom: 5,
  }
});