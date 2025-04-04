import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { BACKEND_URL } from '@/config';

export default function EditPersonal() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [userExists, setUserExists] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/users/1`);

        if (response.ok) {
          const data = await response.json();
          setName(data.name || '');
          setEmail(data.email || '');
          setUserExists(true);
        } else if (response.status === 404) {
          console.log('User not found. Showing empty form.');
          setUserExists(false);
        } else {
          console.warn('Unexpected response:', await response.text());
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        Alert.alert('Error', 'Could not fetch user details.');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleSave = async () => {
    if (!name || !email) {
      Alert.alert('Missing Information', 'Please enter both name and email.');
      return;
    }

    const endpoint = userExists
      ? `${BACKEND_URL}/api/users/1`
      : `${BACKEND_URL}/api/users`;

    const method = userExists ? 'PUT' : 'POST';

    const body = userExists
      ? { id: 1, name, email }
      : { name, email };

    try {
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        console.log(userExists ? 'User updated' : 'User created');
        router.push('/profile');
      } else if (response.status === 409) {
        Alert.alert('Conflict', 'User already exists.');
      } else {
        const errorText = await response.text();
        console.error('Error saving user:', errorText);
        Alert.alert('Error', 'Failed to save user details.');
      }
    } catch (error) {
      console.error('Network error:', error);
      Alert.alert('Error', 'A network error occurred.');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>
        {userExists ? 'Edit Your Details' : 'Welcome! Enter Your Details'}
      </Text>

      <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your name"
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>
          {userExists ? 'Update Details' : 'Create Account'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#555',
  },
  input: {
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
