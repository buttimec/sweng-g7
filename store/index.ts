
import { create } from "zustand";

// Define the type for the store
interface LocationStore {
  userAddress: string | null;
  userLongitude: number | null;
  userLatitude: number | null;
  destinationLongitude: number | null;
  destinationLatitude: number | null;
  destinationAddress: string | null;

  setUserLocation: (location: { latitude: number; longitude: number; address: string }) => void;
  setDestinationLocation: (location: { latitude: number; longitude: number; address: string }) => void;
}

// Create the Zustand store with types
export const useLocationStore = create<LocationStore>((set) => ({
  userAddress: null,
  userLongitude: null,
  userLatitude: null,
  destinationLongitude: null,
  destinationLatitude: null,
  destinationAddress: null,

  setUserLocation: ({ latitude, longitude, address }) => {
    set(() => ({
      userLatitude: latitude,
      userLongitude: longitude,
      userAddress: address,
    }));
  },

  setDestinationLocation: ({ latitude, longitude, address }) => {
    set(() => ({
      destinationLatitude: latitude,
      destinationLongitude: longitude,
      destinationAddress: address,
    }));
  },
}));
