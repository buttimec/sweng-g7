import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { BACKEND_URL } from '@/config';

export default function EditSavedTrips() {
  const router = useRouter();
  const [routes, setRoutes] = useState([]);
  const [newRoute, setNewRoute] = useState('');

  // On mount, fetch the favourite routes from the backend
  useEffect(() => {
    const loadRoutes = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/FaveRoutes`);
        const data = await res.json();
        setRoutes(data);
      } catch (error) {
        console.error('Error fetching routes:', error);
      }
    };

    loadRoutes();
  }, []);

  const handleAddRoute = () => {
    if (newRoute) {
      // Create a new route object. The backend will generate an id when saved.
      const route = { name: newRoute };
      setRoutes(prev => [...prev, route]);
      setNewRoute('');
    }
  };

  const handleDeleteRoute = async (route) => {
    // If route has an id, delete it from the backend.
    if (route.id) {
      try {
        await fetch(`${BACKEND_URL}/api/FaveRoutes/${route.id}`, {
          method: 'DELETE',
        });
      } catch (error) {
        console.error('Error deleting route:', error);
      }
    }
    // Remove route from local state.
    setRoutes(prev => prev.filter(r => (r.id || r.name) !== (route.id || route.name)));
  };

  const handleSave = async () => {
    try {
      // Save routes
      const response = await fetch(`${BACKEND_URL}/api/FaveRoutes/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(routes),
      });
      const data = await response.json();
      console.log('Saved routes:', data);

      const res = await fetch(`${BACKEND_URL}/api/FaveRoutes`);
      const savedRoutes = await res.json();
      setRoutes(savedRoutes);

      router.push('/profile');
    } catch (error) {
      console.error('Error saving routes:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Edit Favourite Routes</Text>
      <FlatList 
         data={routes}
         keyExtractor={(item, index) => (item.id ? item.id.toString() : index.toString())}
         renderItem={({ item }) => (
           <View style={styles.routeItem}>
             <Text style={styles.routeText}> 📍 {item.name}</Text>
             <TouchableOpacity onPress={() => handleDeleteRoute(item)} style={styles.deleteButton}>
               <Text style={styles.deleteButtonText}>Delete</Text>
             </TouchableOpacity>
           </View>
         )}
      />
      <TextInput 
         style={styles.input}
         placeholder="Enter route destination"
         value={newRoute}
         onChangeText={setNewRoute}
      />
      <TouchableOpacity style={styles.addButton} onPress={handleAddRoute}>
         <Text style={styles.buttonText}>Add Route</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
         <Text style={styles.buttonText}>Save Routes</Text>
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
    fontSize: 28, 
    fontWeight: '700', 
    marginBottom: 20, 
    textAlign: 'center', 
    color: '#333' 
  },
  routeItem: { 
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  routeText: { 
    fontSize: 18, 
    color: '#333' 
  },
  input: { 
    backgroundColor: '#fff', 
    borderWidth: 1, 
    borderColor: '#ddd', 
    borderRadius: 8, 
    paddingHorizontal: 15, 
    paddingVertical: 12, 
    fontSize: 16, 
    marginVertical: 15,
  },
  addButton: { 
    backgroundColor: '#28a745', 
    paddingVertical: 12, 
    paddingHorizontal: 20, 
    borderRadius: 8, 
    alignItems: 'center', 
    marginBottom: 10 
  },
  saveButton: { 
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
