import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function EditSavedTrips() {
  const router = useRouter();
  const [trips, setTrips] = useState([
    { id: '1', title: 'Trip to Dublin', date: '2023-10-20' },
    { id: '2', title: 'Trip to Cork', date: '2023-11-05' },
  ]);
  const [newTrip, setNewTrip] = useState('');

  const handleAddTrip = () => {
    if (newTrip) {
      setTrips(prev => [...prev, { id: Date.now().toString(), title: newTrip, date: 'TBA' }]);
      setNewTrip('');
    }
  };

  const handleSave = () => {
    // Future: Save trips to your database
    console.log('Saved trips:', trips);
    router.back();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Edit Saved Trips</Text>
      <FlatList 
         data={trips}
         keyExtractor={(item) => item.id}
         renderItem={({ item }) => (
           <View style={styles.tripItem}>
             <Text style={styles.tripText}>{item.title} - {item.date}</Text>
           </View>
         )}
      />
      <TextInput 
         style={styles.input}
         placeholder="New trip title"
         value={newTrip}
         onChangeText={setNewTrip}
      />
      <TouchableOpacity style={styles.addButton} onPress={handleAddTrip}>
         <Text style={styles.buttonText}>Add Trip</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={handleSave}>
         <Text style={styles.buttonText}>Save Trips</Text>
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
  tripItem: { 
    paddingVertical: 8 
  },
  tripText: { 
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
