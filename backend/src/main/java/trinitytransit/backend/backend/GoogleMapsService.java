package trinitytransit.backend.backend;

import aj.org.objectweb.asm.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.maps.GeoApiContext;
import com.google.maps.GeocodingApi;
import com.google.maps.model.*;
import com.google.maps.PlacesApi;
import com.google.maps.DirectionsApi;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class GoogleMapsService {
    private final GeoApiContext context;

    public GoogleMapsService(GeoApiContext context) {
        this.context = context;
    }
    private static final String API_URL = "https://api.nationaltransport.ie/gtfsr/v2/Vehicles?format=json";
    private static final String API_KEY = "9b70ea23a4a94ba68a7ebba3fadcd818";

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

    public List<LatLng> getNearbyBuses(LatLng location, int radius) throws Exception {
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

            List<LatLng> nearbyBuses = new ArrayList<>();
            for (JsonNode entity : entities) {
                JsonNode vehicle = entity.get("vehicle");
                JsonNode position = vehicle.get("position");

                double lat = position.get("latitude").asDouble();
                double lng = position.get("longitude").asDouble();

                // Calculate the distance between the current bus location and the requested location
                LatLng busLocation = new LatLng(lat, lng);
                double distance = calculateDistance(location, busLocation);

                // If the distance is within the radius, add it to the list
                if (distance <= radius) {
                    nearbyBuses.add(busLocation);
                    System.out.println(busLocation.lat);
                    System.out.println(busLocation.lng);
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

