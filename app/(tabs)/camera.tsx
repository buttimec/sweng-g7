import React, { useState, useRef, useEffect } from 'react';
import { Text, View, StyleSheet, Button, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import { Ionicons } from '@expo/vector-icons';
import { BACKEND_URL } from '@/config';
import * as ImageManipulator from 'expo-image-manipulator';
import { useRouter } from 'expo-router';

export default function PhoneCamera() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [hasMediaPermission, setHasMediaPermission] = useState<boolean | null>(null);
  const cameraRef = useRef<React.ElementRef<typeof CameraView>>(null);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const mediaPermission = await MediaLibrary.requestPermissionsAsync();
      setHasMediaPermission(mediaPermission.status === 'granted');
    })();
  }, []);

  if (!permission) {
    return <View />;
  }
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Enable Camera Permissions</Text>
        <Button onPress={requestPermission} title="Grant permission" />
      </View>
    );
  }

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const capturePhoto = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync({ base64: false });
      console.log('Captured:', photo.uri);
  
      const resized = await ImageManipulator.manipulateAsync(
        photo.uri,
        [{ resize: { width: 800 } }], // Resize to reduce file size
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      );
  
      console.log('Resized:', resized.uri);
  
      if (hasMediaPermission) {
        await MediaLibrary.createAssetAsync(resized.uri);
      }
  
      await uploadPhotoToDatabase(resized);
    }
  };

  const uploadPhotoToDatabase = async (photo: { uri: string; base64?: string }) => {
    try {
      console.log('Uploading photo to the database...');
      const formData = new FormData();
      formData.append('photo', {
        uri: photo.uri,
        type: 'image/jpeg',
        name: 'photo.jpg',
      } as any);

      // could add the busStopID / busID that the photo is linked to.
      //formData.append('busStopId', 'BUS_STOP_ID_HERE');
      //formData.append('routeId', 'ROUTE_ID_HERE');

      const response = await fetch(`${BACKEND_URL}/api/photos/upload`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.ok) {
        const result = await response.text();
        console.log('Photo uploaded successfully. Database response:', result);
      } else {
        const errorText = await response.text(); // fallback for non-JSON errors
        console.error('Upload failed:', response.status, errorText);
      }


    } catch (error) {
      console.error('Error uploading photo to database:', error);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
        <View style={styles.topButtonContainer}>
          <TouchableOpacity onPress={toggleCameraFacing} style={styles.flipButton}>
            <Ionicons name="camera-reverse" size={32} color="white" />
          </TouchableOpacity>
        </View>
        <View style={styles.bottomButtonContainer}>
          <TouchableOpacity onPress={capturePhoto} style={styles.captureButton}>
            <Ionicons name="camera" size={32} color="white" />
          </TouchableOpacity>
        </View>
        <View style={styles.galleryButtonContainer}>
          <TouchableOpacity onPress={() => router.push('/gallery')} style={styles.galleryButton}>
            <Ionicons name="images-outline" size={28} color="white" />
          </TouchableOpacity>
        </View>


      </CameraView>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
  },
  camera: { 
    flex: 1,
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  topButtonContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  flipButton: {
    padding: 10,
  },
  bottomButtonContainer: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
  },
  captureButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 50,
    padding: 20,
  },
  galleryButtonContainer: {
    position: 'absolute',
    bottom: 30,
    right: 30,
  },
  
  galleryButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 14,
    borderRadius: 40,
  },
});
