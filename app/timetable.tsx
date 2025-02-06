import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function Timetable() {
  const busTimetable = [
    { bus: 'Bus 1', time: '08:00 AM' },
    { bus: 'Bus 2', time: '08:30 AM' },
    { bus: 'Bus 3', time: '09:00 AM' },
    { bus: 'Bus 4', time: '09:30 AM' },
    { bus: 'Bus 5', time: '10:00 AM' },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Today's Bus Timetable</Text>
      {busTimetable.map((item, index) => (
        <View key={index} style={styles.row}>
          <Text style={styles.busText}>{item.bus}</Text>
          <Text style={styles.timeText}>{item.time}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  busText: {
    fontSize: 16,
    color: '#333',
  },
  timeText: {
    fontSize: 16,
    color: '#333',
  },
});
