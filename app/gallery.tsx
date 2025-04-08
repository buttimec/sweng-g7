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
  Alert,
  TextInput,
  FlatList,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BACKEND_URL } from '@/config';

type PhotoMeta = {
  id: number;
  filename: string;
  description?: string;
  uploadTime?: string;
  assignedBus?: string;
  assignedBusStop?: string;
};

export default function GalleryScreen() {
  const router = useRouter();
  const [photos, setPhotos] = useState<PhotoMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoMeta | null>(null);
  const [editingDescription, setEditingDescription] = useState('');

  const [savedBuses, setSavedBuses] = useState<any[]>([]);
  const [favouriteStops, setFavouriteStops] = useState<any[]>([]);
  const [selectedBus, setSelectedBus] = useState<any | null>(null);
  const [selectedStop, setSelectedStop] = useState<any | null>(null);

  useEffect(() => {
    fetchPhotos();
  }, []);

  // When a photo is selected, fetch saved buses and bus stops
  useEffect(() => {
    if (selectedPhoto) {
      fetchSavedBuses();
      fetchFavouriteStops();
    }
  }, [selectedPhoto]);

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

  const fetchSavedBuses = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/buses`);
      if (res.ok) {
        const data = await res.json();
        console.log("Saved buses response:", data);
        setSavedBuses(data);
      } else {
        console.error("Failed to fetch saved buses:", res.statusText);
      }
    } catch (err) {
      console.error("Error fetching saved buses:", err);
    }
  };

  const fetchFavouriteStops = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/busstops`);
      if (res.ok) {
        const data = await res.json();
        setFavouriteStops(data);
      }
    } catch (err) {
      console.error("Failed to fetch saved bus stops:", err);
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

  const handleSaveAll = async () => {
    if (!selectedPhoto) return;
    const assignmentPayload: any = {};
    if (selectedBus) {
      assignmentPayload.bus = selectedBus.route;
    }
    if (selectedStop) {
      assignmentPayload.busStop = selectedStop.name;
    }
    try {
      const assignmentRes = await fetch(`${BACKEND_URL}/api/photos/${selectedPhoto.id}/assignment`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assignmentPayload),
      });
      const descRes = await fetch(`${BACKEND_URL}/api/photos/${selectedPhoto.id}/description`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: editingDescription }),
      });
      if (assignmentRes.ok && descRes.ok) {
        Alert.alert('Photo updated successfully.');
        const updatedPhoto = {
          ...selectedPhoto,
          assignedBus: assignmentPayload.bus || selectedPhoto.assignedBus,
          assignedBusStop: assignmentPayload.busStop || selectedPhoto.assignedBusStop,
          description: editingDescription,
        };
        setSelectedPhoto(updatedPhoto);
        fetchPhotos();
      } else {
        Alert.alert('Failed to update photo.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error updating photo.');
    }
  };

  const handleClearAssignment = async () => {
    if (!selectedPhoto) return;
    try {
      const payload = { bus: "", busStop: "" };
      const res = await fetch(`${BACKEND_URL}/api/photos/${selectedPhoto.id}/assignment`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        Alert.alert('Assignment cleared successfully.');
        const updatedPhoto = { ...selectedPhoto, assignedBus: "", assignedBusStop: "" };
        setSelectedPhoto(updatedPhoto);
        fetchPhotos();
      } else {
        Alert.alert('Failed to clear assignment.');
      }
    } catch (error) {
      console.error('Error clearing assignment', error);
      Alert.alert('Error clearing assignment.');
    }
  };

  const renderBusItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[
        styles.assignmentItem,
        selectedBus && selectedBus.id === item.id && styles.assignmentItemSelected,
      ]}
      onPress={() => {
        if (selectedBus && selectedBus.id === item.id) {
          setSelectedBus(null);
        } else {
          setSelectedBus(item);
        }
      }}
    >
      <Text style={{ color: selectedBus && selectedBus.id === item.id ? '#fff' : '#000' }}>
        {item.route}
      </Text>
    </TouchableOpacity>
  );

  const renderStopItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[
        styles.assignmentItem,
        selectedStop && selectedStop.id === item.id && styles.assignmentItemSelected,
      ]}
      onPress={() => {
        if (selectedStop && selectedStop.id === item.id) {
          setSelectedStop(null);
        } else {
          setSelectedStop(item);
        }
      }}
    >
      <Text style={{ color: selectedStop && selectedStop.id === item.id ? '#fff' : '#000' }}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Photo Gallery',
          headerTitleAlign: 'center',
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
        <View style={styles.galleryContainer}>
          <Text style={styles.pageTitle}>Your Gallery</Text>
          <ScrollView contentContainerStyle={styles.gallery}>
            {photos.map((photo) => {
              const tagText =
                photo.assignedBus && photo.assignedBusStop
                  ? `${photo.assignedBus} / ${photo.assignedBusStop}`
                  : photo.assignedBus || photo.assignedBusStop || '';
              return (
                <TouchableOpacity
                  key={photo.id}
                  onPress={() => {
                    setSelectedPhoto(photo);
                    setEditingDescription(photo.description || '');
                  }}
                  style={styles.photoContainer}
                >
                  <Image
                    source={{ uri: `${BACKEND_URL}/api/photos/${photo.id}` }}
                    style={styles.photo}
                  />
                  {tagText !== '' && (
                    <View style={styles.tag}>
                      <Text style={styles.tagText}>{tagText}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      <TouchableOpacity onPress={() => router.push('/camera')} style={styles.backArrowButton}>
        <Ionicons name="arrow-back-circle" size={48} color="#007AFF" />
      </TouchableOpacity>

      <Modal visible={!!selectedPhoto} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Photo Details</Text>
              <TouchableOpacity onPress={() => setSelectedPhoto(null)}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.modalContent}>
              {selectedPhoto && (
                <>
                  <Image
                    source={{ uri: `${BACKEND_URL}/api/photos/${selectedPhoto.id}` }}
                    style={styles.enlargedImage}
                  />
                  <View style={styles.metaContainer}>
                    <Text style={styles.metaText}>ID: {selectedPhoto.id}</Text>
                    <Text style={styles.metaText}>Name: {selectedPhoto.filename}</Text>
                    {selectedPhoto.uploadTime && (
                      <Text style={styles.metaText}>
                        Uploaded: {new Date(selectedPhoto.uploadTime).toLocaleString()}
                      </Text>
                    )}
                  </View>
                  
                  <Text style={styles.sectionTitle}>Description</Text>
                  <Text style={styles.descriptionDisplay}>
                    {selectedPhoto.description ? selectedPhoto.description : 'No description yet.'}
                  </Text>
                  <Text style={styles.sectionTitle}>Assigned Bus</Text>
                  <Text style={styles.assignmentDisplayText}>
                    {selectedPhoto.assignedBus ? selectedPhoto.assignedBus : 'None'}
                  </Text>
                  <Text style={styles.sectionTitle}>Assigned Bus Stop</Text>
                  <Text style={styles.assignmentDisplayText}>
                    {selectedPhoto.assignedBusStop ? selectedPhoto.assignedBusStop : 'None'}
                  </Text>
                  <Text style={styles.sectionTitle}>Assign Bus</Text>
                  <FlatList
                    data={savedBuses}
                    horizontal
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderBusItem}
                    contentContainerStyle={styles.assignmentList}
                    showsHorizontalScrollIndicator={false}
                  />
                  <Text style={styles.sectionTitle}>Assign Bus Stop</Text>
                  <FlatList
                    data={favouriteStops}
                    horizontal
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderStopItem}
                    contentContainerStyle={styles.assignmentList}
                    showsHorizontalScrollIndicator={false}
                  />
                  <Text style={styles.sectionTitle}>Edit Description</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Type new description..."
                    value={editingDescription}
                    onChangeText={setEditingDescription}
                    multiline
                  />

                  <TouchableOpacity onPress={handleSaveAll} style={styles.assignButton}>
                    <Ionicons name="checkmark-done-outline" size={20} color="white" />
                    <Text style={styles.assignText}>Save</Text>
                  </TouchableOpacity>
                  <View style={styles.buttonRow}>
                    <TouchableOpacity
                      onPress={handleClearAssignment}
                      style={[
                        styles.clearButtonRow,
                        !(selectedPhoto.assignedBus || selectedPhoto.assignedBusStop) && styles.disabledButton,
                      ]}
                      disabled={!(selectedPhoto.assignedBus || selectedPhoto.assignedBusStop)}
                    >
                      <Ionicons name="close-circle-outline" size={20} color="white" />
                      <Text style={styles.clearButtonText}>Clear Assignment</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
                      <Ionicons name="trash-outline" size={20} color="white" />
                      <Text style={styles.deleteText}>Delete Photo</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  galleryContainer: { flex: 1 },
  pageTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#007AFF',
    textAlign: 'center',
    marginVertical: 20,
  },
  gallery: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    justifyContent: 'center',
  },
  photoContainer: {
    position: 'relative',
    margin: 6,
  },
  photo: {
    width: 140,
    height: 140,
    borderRadius: 8,
    backgroundColor: '#ccc',
  },
  tag: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagText: {
    color: '#fff',
    fontSize: 10,
  },
  backArrowButton: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    zIndex: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '100%',
    maxWidth: 400,
    maxHeight: '90%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  modalContent: {
    padding: 16,
    alignItems: 'center',
  },
  enlargedImage: {
    width: 250,
    height: 250,
    borderRadius: 8,
    marginBottom: 12,
  },
  metaContainer: {
    width: '100%',
    marginBottom: 12,
  },
  metaText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  sectionTitle: {
    alignSelf: 'flex-start',
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 8,
    marginTop: 12,
  },
  descriptionDisplay: {
    alignSelf: 'flex-start',
    fontSize: 14,
    color: '#444',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#f2f2f2',
    padding: 10,
    width: '100%',
    borderRadius: 8,
    fontSize: 14,
    marginBottom: 12,
  },
  assignmentDisplayText: {
    alignSelf: 'flex-start',
    fontSize: 14,
    color: '#444',
    marginBottom: 4,
  },
  assignmentList: {
    paddingVertical: 8,
  },
  assignmentItem: {
    padding: 10,
    marginRight: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
  },
  assignmentItemSelected: {
    backgroundColor: '#007AFF',
  },
  assignButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    alignSelf: 'stretch',
    justifyContent: 'center',
  },
  assignText: {
    color: 'white',
    marginLeft: 6,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 16,
    alignSelf: 'stretch',
    justifyContent: 'space-between',
  },
  clearButtonRow: {
    flex: 1,
    backgroundColor: '#FF3B30',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  clearButtonText: { color: 'white', marginLeft: 6, fontWeight: '600' },
  deleteButton: {
    flex: 1,
    backgroundColor: '#FF3B30',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  deleteText: { color: 'white', marginLeft: 6, fontWeight: '600' },
  disabledButton: {
    backgroundColor: '#aaa',
  },
});

export default GalleryScreen;
