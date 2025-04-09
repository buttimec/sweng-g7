import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { BACKEND_URL } from '@/config';

export default function EditTransport() {
  const router = useRouter();
  const [providers, setProviders] = useState([]);
  const [newProvider, setNewProvider] = useState('');

 // On mount, fetch the favourite providers from the backend
  useEffect(() => {
    const loadProviders = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/favourites/1`);
        const data = await res.json();
        setProviders(data);
      } catch (error) {
        console.error('Error fetching transport providers:', error);
      }
    };

    loadProviders();
  }, []);

  // looking into referencing provider table
  const handleAddProvider = () => {
    if (newProvider) {
      const provider = { name: newProvider };
      setProviders(prev => [...prev, provider]);
      setNewProvider('');
      try {
        const provRes = await fetch(`${BACKEND_URL}/api/providers/by-name/` + provider.name);
        const provData = await provRes.json();
        const urlString = `${BACKEND_URL}/api/favourites/add?userId=1&providerId=` + provider.id;
        const response = await fetch(urlString, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(providers),
        });
        const data = await response.json();
        console.log('Saved providers:', data);
  
        const res = await fetch(`${BACKEND_URL}/api/favourites`);
        const savedProviders = await res.json();
        setProviders(savedProviders);
  
        router.push('/profile');
      } catch (error) {
        console.error('Error saving providers:', error);
      }
    }
  };

  //Bring up: Backend delete api can only delete by user id?
  const handleDeleteProvider = async (provider) => {
    // If provider has an id, delete it from the backend.
    if (provider.id) {
      try {
        await fetch(`${BACKEND_URL}/api/favourites/${provider.id}`, {
          method: 'DELETE',
        });
      } catch (error) {
        console.error('Error deleting provider:', error);
      }
    }
    // Remove route from local state.
    setProviders(prev => prev.filter(p => (p.id || p.name) !== (provider.id || provider.name)));
  };

  //const handleSave = () => {
  //  try {
  //    // Save providers
  //    const response = await fetch(`${BACKEND_URL}/api/favourites/add?userId=1&providerId=`, {
  //      method: 'POST',
  //      headers: { 'Content-Type': 'application/json' },
  //      body: JSON.stringify(providers),
  //    });
  //    const data = await response.json();
  //    console.log('Saved providers:', data);
//
  //    const res = await fetch(`${BACKEND_URL}/api/favourites`);
  //    const savedProviders = await res.json();
  //    setProviders(savedProviders);
//
  //    router.push('/profile');
  //  } catch (error) {
  //    console.error('Error saving providers:', error);
  //  }
  //};

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Edit Preferred Transport Providers</Text>
      <FlatList 
        data={providers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.providerItem}>
            <Text style={styles.providerText}>{item.name}</Text>
            <TouchableOpacity onPress={() => handleDeleteProvider(item)} style={styles.deleteButton}>
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      />
      <TextInput 
        style={styles.input}
        placeholder="New provider name"
        value={newProvider}
        onChangeText={setNewProvider}
      />
      <TouchableOpacity style={styles.addButton} onPress={handleAddProvider}>
        <Text style={styles.buttonText}>Add Provider</Text>
      </TouchableOpacity>
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
    paddingVertical: 8 
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
  buttonText: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: '600' 
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 14,
  }
});
