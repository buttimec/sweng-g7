import React from 'react';
import { Text, View, Button, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';  // Use expo-router for navigation

export default function Index() {
  const router = useRouter();  

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Welcome to TrinityTransit!</Text>
      <Text style={styles.subHeader}>Your Bus Timetabling App</Text>

      <Button
        title="View Timetable"
        onPress={() => router.push('/timetable')}
        color="#007BFF"
      />

      <Button
        title="View Map"
        onPress={() => router.push('/map')}  
        color="#28a745"  
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f4f4f4',
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 16,
  },
  subHeader: {
    fontSize: 16,
    color: '#555',
    marginBottom: 20,
  },
});
