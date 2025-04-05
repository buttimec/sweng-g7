import { create } from "zustand";

export interface TripUpdate {
  routeShortName: string;
  totalDelay: number;
  stopName: string;
  transportation: string;
}

interface ApiCacheStore {
  tripUpdates: TripUpdate[] | null;
  tripUpdatesTimestamp: number | null;
  nearbyBuses: any[] | null;
  nearbyBusesTimestamp: number | null;
  nearbyBusStops: any[] | null;
  nearbyBusStopsTimestamp: number | null;
  setTripUpdates: (updates: TripUpdate[], timestamp: number) => void;
  setNearbyBuses: (buses: any[], timestamp: number) => void;
  setNearbyBusStops: (stops: any[], timestamp: number) => void;
}

export const useApiCacheStore = create<ApiCacheStore>((set) => ({
  tripUpdates: null,
  tripUpdatesTimestamp: null,
  nearbyBuses: null,
  nearbyBusesTimestamp: null,
  nearbyBusStops: null,
  nearbyBusStopsTimestamp: null,
  setTripUpdates: (updates, timestamp) =>
    set(() => ({ tripUpdates: updates, tripUpdatesTimestamp: timestamp })),
  setNearbyBuses: (buses, timestamp) =>
    set(() => ({ nearbyBuses: buses, nearbyBusesTimestamp: timestamp })),
  setNearbyBusStops: (stops, timestamp) =>
    set(() => ({ nearbyBusStops: stops, nearbyBusStopsTimestamp: timestamp })),
}));
