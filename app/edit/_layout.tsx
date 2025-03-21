// app/edit/_layout.tsx
import React from 'react';
import { Stack } from 'expo-router';

export default function EditLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true, // Show header for edit screens
        // You can add additional header options here:
        // headerStyle: { backgroundColor: '#007AFF' },
        // headerTintColor: '#fff',
        // headerTitleStyle: { fontWeight: 'bold' },
      }}
    />
  );
}
