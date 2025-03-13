import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function EditPersonal() {
  const router = useRouter();
  const [name, setName] = useState('John Doe');
  const [email, setEmail] = useState('john.doe@example.com');

  const handleSave = () => {
    // Waiting on the database integration
    console.log('Saved personal details:', { name, email });
    router.back();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Edit Personal Details</Text>
      <Text style={styles.label}>Name</Text>
      <TextInput 
         style={styles.input}
         value={name}
         onChangeText={setName}
      />
      <Text style={styles.label}>Email</Text>
      <TextInput 
         style={styles.input}
         value={email}
         onChangeText={setEmail}
         keyboardType="email-address"
      />
      <TouchableOpacity style={styles.button} onPress={handleSave}>
         <Text style={styles.buttonText}>Save</Text>
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
  label: { 
    fontSize: 16, 
    color: '#555', 
    marginBottom: 8 
  },
  input: { 
    backgroundColor: '#fff', 
    borderWidth: 1, 
    borderColor: '#ddd', 
    borderRadius: 8, 
    paddingHorizontal: 15, 
    paddingVertical: 10, 
    fontSize: 16, 
    marginBottom: 15 
  },
  button: { 
    backgroundColor: '#007AFF', 
    paddingVertical: 12, 
    paddingHorizontal: 20, 
    borderRadius: 8, 
    alignItems: 'center', 
    marginTop: 10 
  },
  buttonText: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: '600' 
  },
});
