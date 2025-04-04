import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  Pressable,
  Alert,
  TextInput,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BACKEND_URL } from '@/config';

type PhotoMeta = {
  id: number;
  filename: string;
  description?: string;
  uploadTime?: string;
};

export default function GalleryScreen() {
  const router = useRouter();
  const [photos, setPhotos] = useState<PhotoMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoMeta | null>(null);
  const [editingDescription, setEditingDescription] = useState('');

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/photos`);
      const data = await response.json();

      if (Array.isArray(data)) {
        setPhotos(data);
      }
    } catch (error) {
      console.error('Error fetching photos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedPhoto) return;

    try {
      const res = await fetch(`${BACKEND_URL}/api/photos/${selectedPhoto.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setSelectedPhoto(null);
        fetchPhotos();
      } else {
        Alert.alert('Failed to delete photo.');
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const handleSaveDescription = async () => {
    if (!selectedPhoto) return;
  
    try { //updating description of image (could do the save for bus id if we get time before release 2)
      const res = await fetch(`${BACKEND_URL}/api/photos/${selectedPhoto.id}/description`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: editingDescription }),
      });
  
      if (res.ok) {
        await fetchPhotos();
  
        const updated = photos.find(p => p.id === selectedPhoto.id);
        if (updated) setSelectedPhoto(updated);
  
        Alert.alert('Description updated');
      } else {
        Alert.alert('Failed to update description.');
      }
    } catch (error) {
      console.error('Update error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Photo Gallery',
          headerRight: () => (
            <TouchableOpacity onPress={() => router.push('/camera')} style={{ marginRight: 16 }}>
              <Ionicons name="camera-outline" size={24} color="#007AFF" />
            </TouchableOpacity>
          ),
        }}
      />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : photos.length === 0 ? (
        <View style={styles.center}>
          <Text>No photos found.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.gallery}>
          {photos.map((photo) => (
            <TouchableOpacity key={photo.id} onPress={() => {
              setSelectedPhoto(photo);
              setEditingDescription(photo.description || '');
            }}>
              <Image
                source={{ uri: `${BACKEND_URL}/api/photos/${photo.id}` }}
                style={styles.photo}
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <TouchableOpacity
        onPress={() => router.push('/camera')}
        style={styles.backArrowButton}
      >
        <Ionicons name="arrow-back-circle" size={48} color="#007AFF" />
      </TouchableOpacity>
      <Modal visible={!!selectedPhoto} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setSelectedPhoto(null)}>
          <View style={styles.enlargedContainer}>
            {selectedPhoto && (
              <>
                <Image
                  source={{ uri: `${BACKEND_URL}/api/photos/${selectedPhoto.id}` }}
                  style={styles.enlargedImage}
                />
                <Text style={styles.metaText}>ID: {selectedPhoto.id}</Text>
                <Text style={styles.metaText}>Name: {selectedPhoto.filename}</Text>
                {selectedPhoto.uploadTime && (
                  <Text style={styles.metaText}>Uploaded: {new Date(selectedPhoto.uploadTime).toLocaleString()}</Text>
                )}

                <Text style={styles.descriptionLabel}>Description:</Text>
                <Text style={styles.descriptionText}>
                    {selectedPhoto.description?.trim() || 'No description yet.'}
                </Text>

                <Text style={styles.editLabel}>Edit Description:</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Type new description..."
                    value={editingDescription}
                    onChangeText={setEditingDescription}
                    multiline
                />

                <View style={styles.buttonRow}>
                  <TouchableOpacity onPress={handleSaveDescription} style={styles.saveButton}>
                    <Ionicons name="save-outline" size={20} color="white" />
                    <Text style={styles.saveText}>Save</Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
                    <Ionicons name="trash-outline" size={20} color="white" />
                    <Text style={styles.deleteText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  gallery: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    justifyContent: 'center',
  },
  photo: {
    width: 100,
    height: 100,
    margin: 6,
    borderRadius: 8,
    backgroundColor: '#ccc',
  },
  backArrowButton: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    zIndex: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  enlargedContainer: {
    alignItems: 'center',
    width: '85%',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
  },
  enlargedImage: {
    width: 280,
    height: 280,
    borderRadius: 12,
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#f2f2f2',
    padding: 10,
    width: '100%',
    borderRadius: 8,
    fontSize: 14,
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  saveText: { color: 'white', marginLeft: 6, fontWeight: '600' },
  deleteText: { color: 'white', marginLeft: 6, fontWeight: '600' },
  metaText: {
    fontSize: 13,
    marginBottom: 4,
    color: '#333',
  },
  descriptionLabel: {
    alignSelf: 'flex-start',
    fontWeight: '600',
    marginBottom: 4,
    color: '#333',
    marginTop: 10,
  },
  descriptionText: {
    alignSelf: 'flex-start',
    fontSize: 14,
    color: '#444',
    marginBottom: 12,
  },
  editLabel: {
    alignSelf: 'flex-start',
    fontSize: 12,
    marginBottom: 4,
    color: '#777',
  },
});
