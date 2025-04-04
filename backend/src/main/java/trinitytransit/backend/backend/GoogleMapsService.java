package trinitytransit.backend.backend;

import aj.org.objectweb.asm.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.maps.GeoApiContext;
import com.google.maps.GeocodingApi;
import com.google.maps.model.*;
import com.google.maps.PlacesApi;
import com.google.maps.DirectionsApi;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class GoogleMapsService {
    private final GeoApiContext context;

    private static final String API_URL = "https://api.nationaltransport.ie/gtfsr/v2/Vehicles?format=json";
    private static final String API_KEY = "9b70ea23a4a94ba68a7ebba3fadcd818";

    private static final String[] TRANSPORTATION_TYPES = { "GTFS_Dublin_Bus", "GTFS_Bus_Eireann", "GTFS_Irish_Rail", "GTFS_LUAS" };
    private Map<String, String> routeShortNames = new HashMap<>();
    private Map<String, String> routeLongNames = new HashMap<>();
    private Map<String, String> tripNames = new HashMap<>();
    private Map<String, String> transportationMapping = new HashMap<>();

    public GoogleMapsService(GeoApiContext context) {
        this.context = context;
        for (String transport : TRANSPORTATION_TYPES) {
            loadRouteShortNames(transport);
            loadTripNames(transport);
        }
    }

    private void loadRouteShortNames(String transport) {
        String filePath = transport + "/routes.txt";
        try (InputStream inputStream = new ClassPathResource(filePath).getInputStream();
             BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream))) {

            String line;
            boolean isHeader = true;
            while ((line = reader.readLine()) != null) {
                if (isHeader) {
                    isHeader = false; // Skip header
                    continue;
                }

                String[] parts = line.split(",");
                if (parts.length > 2) {
                    routeShortNames.put(parts[0], parts[2]);
                    routeLongNames.put(parts[0], parts[3]);
                    transportationMapping.put(parts[0], transport);
                }
            }
        } catch (IOException e) {
            System.out.println("❌ Error reading " + filePath + ": " + e.getMessage());
        }
    }

    private void loadTripNames(String transport) {
        String filePath = transport + "/trips.txt";
        try (InputStream inputStream = new ClassPathResource(filePath).getInputStream();
             BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream))) {

            String line;
            boolean isHeader = true;
            while ((line = reader.readLine()) != null) {
                if (isHeader) {
                    isHeader = false; // Skip header
                    continue;
                }

                String[] parts = line.split(",");
                if (parts.length > 3) {
                    tripNames.put(parts[2], parts[3]);
                }
            }
        } catch (IOException e) {
            System.out.println("❌ Error reading " + filePath + ": " + e.getMessage());
        }
    }

    public GeocodingResult[] geocodeAddress(String address) throws Exception {
        return GeocodingApi.geocode(context, address).await();
    }

    public PlacesSearchResult[] getNearbyBusStops(LatLng location, int radius) throws Exception {
        return PlacesApi.nearbySearchQuery(context, location)
                .radius(radius)
                .type(PlaceType.BUS_STATION)
                .await()
                .results;
    }

    public DirectionsRoute[] getDirections(LatLng origin, LatLng destination) throws Exception {
        return DirectionsApi.newRequest(context)
                .origin(origin)
                .destination(destination)
                .departureTimeNow()
                .mode(TravelMode.TRANSIT)
                .alternatives(true)
                .await()
                .routes;
    }

    public PlaceDetails getDetails(String placeId) throws Exception {
        return PlacesApi.placeDetails(context, placeId).await();
    }

    public List<Bus> getNearbyBuses(LatLng location, int radius) throws Exception {
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.set("x-api-key", API_KEY);
        headers.set("Accept", "application/json");

        try {
            HttpEntity<String> httpentity = new HttpEntity<>(headers);
            ResponseEntity<String> response = restTemplate.exchange(API_URL, HttpMethod.GET, httpentity, String.class);
            String responseBody = response.getBody();

            // Use Jackson's ObjectMapper to parse the response JSON
            ObjectMapper objectMapper = new ObjectMapper();
            JsonNode jsonResponse = objectMapper.readTree(responseBody);
            JsonNode entities = jsonResponse.get("entity");

            List<Bus> nearbyBuses = new ArrayList<>();
            for (JsonNode entity : entities) {
                JsonNode vehicle = entity.get("vehicle");
                JsonNode position = vehicle.get("position");

                String vehicleId = vehicle.get("vehicle").get("id").asText();
                String tripId = vehicle.get("trip").get("trip_id").asText();
                String startTime = vehicle.get("trip").get("start_time").asText();
                String startDate = vehicle.get("trip").get("start_date").asText();
                String scheduleRelationship = vehicle.get("trip").get("schedule_relationship").asText();
                String routeId = vehicle.get("trip").get("route_id").asText();
                int directionId = vehicle.get("trip").get("direction_id").asInt();
                double lat = position.get("latitude").asDouble();
                double lng = position.get("longitude").asDouble();
                long timestamp = vehicle.get("timestamp").asLong();

                String routeShortName = routeShortNames.get(routeId);
                String routeLongName = routeLongNames.get(routeId);
                String transportation = transportationMapping.get(routeId);
                String tripHeadsign = tripNames.get(tripId);
                if (routeShortName == null || tripHeadsign == null || transportation == null) {
                    continue;
                }

                // Calculate the distance between the current bus location and the requested location
                LatLng busLocation = new LatLng(lat, lng);
                double distance = calculateDistance(location, busLocation);

                // If the distance is within the radius, add it to the list
                if (distance <= radius) {
                    Bus busData = new Bus(vehicleId, routeShortName, routeLongName, transportation, tripHeadsign, startTime, startDate,
                            scheduleRelationship, directionId, lat, lng, timestamp);
                    nearbyBuses.add(busData);
                }
            }
            return nearbyBuses;
        } catch (HttpClientErrorException e) {
            throw new Exception("Error fetching data from API", e);
        }
    }

    // Haversine formula to calculate the distance between two geographical points
    private double calculateDistance(LatLng location1, LatLng location2) {
        final double R = 6371; // Radius of the Earth in km
        double lat1 = location1.lat;
        double lng1 = location1.lng;
        double lat2 = location2.lat;
        double lng2 = location2.lng;

        double dLat = Math.toRadians(lat2 - lat1);
        double dLng = Math.toRadians(lng2 - lng1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLng / 2) * Math.sin(dLng / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        double distance = R * c; // Distance in km
        return distance;
    }
}

