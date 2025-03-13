import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function EditTransport() {
  const router = useRouter();
  const [providers, setProviders] = useState([
    { id: '1', name: 'Provider A' },
    { id: '2', name: 'Provider B' },
  ]);
  const [newProvider, setNewProvider] = useState('');

  const handleAddProvider = () => {
    if (newProvider) {
      setProviders(prev => [...prev, { id: Date.now().toString(), name: newProvider }]);
      setNewProvider('');
    }
  };

  const handleSave = () => {
    // Waiting on the database integration
    console.log('Saved providers:', providers);
    router.back();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Edit Preferred Transport Providers</Text>
      <FlatList 
        data={providers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.providerItem}>
            <Text style={styles.providerText}>{item.name}</Text>
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
      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Save Providers</Text>
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
});
