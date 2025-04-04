package trinitytransit.backend.backend;

import org.springframework.stereotype.Service;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;
import java.util.List;
import java.util.stream.Collectors;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.HashMap;
import java.util.Map;
import org.springframework.core.io.ClassPathResource;

@Service
public class TripUpdateService {

    private static final String API_URL = "https://api.nationaltransport.ie/gtfsr/v2/TripUpdates?format=json";
    private static final String API_KEY = "9b70ea23a4a94ba68a7ebba3fadcd818";

    private static final String[] TRANSPORTATION_TYPES = { "GTFS_Dublin_Bus", "GTFS_Bus_Eireann", "GTFS_Irish_Rail", "GTFS_LUAS" };
    private Map<String, String> routeShortNames = new HashMap<>();
    private Map<String, String> stopNames = new HashMap<>();
    private Map<String, String> transportationMapping = new HashMap<>();

    public TripUpdateService() {
        for (String transport : TRANSPORTATION_TYPES) {
            loadRouteShortNames(transport);
            loadStopNames(transport);
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
                    routeShortNames.put(parts[0], parts[2]); // route_id -> route_short_name
                    transportationMapping.put(parts[0], transport); // route_id -> transportation type
                }
            }
            System.out.println("✅ Loaded route short names from " + transport + ": " + routeShortNames.size());
        } catch (IOException e) {
            System.out.println("❌ Error reading " + filePath + ": " + e.getMessage());
        }
    }

    private void loadStopNames(String transport) {
        String filePath = transport + "/stops.txt";
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
                    stopNames.put(parts[0], parts[2]); // stop_id -> stop_name
                }
            }
            System.out.println("✅ Loaded stop names from " + transport + ": " + stopNames.size());
        } catch (IOException e) {
            System.out.println("❌ Error reading " + filePath + ": " + e.getMessage());
        }
    }


    public List<TripUpdate> getTripUpdates() {
        try {
            // Create headers
            HttpHeaders headers = new HttpHeaders();
            headers.set("x-api-key", API_KEY);
            headers.set("Accept", "application/json");

            // Fetch data
            RestTemplate restTemplate = new RestTemplate();
            HttpEntity<String> entity = new HttpEntity<>(headers);
            ResponseEntity<TripUpdateResponse> response = restTemplate.exchange(API_URL, HttpMethod.GET, entity, TripUpdateResponse.class);

            // Extract trip updates
            List<TripUpdateResponse.TripUpdateEntity> tripUpdateEntities = response.getBody().getEntity();

            if (tripUpdateEntities == null || tripUpdateEntities.isEmpty()) {
                System.out.println("⚠️ No trip update entities found!");
                return List.of();
            }

            // Convert API response to our model and limit to 10 responses
            List<TripUpdate> processedUpdates = tripUpdateEntities.stream()
                    .map(this::mapToTripUpdate)
                    .filter(update -> update != null)
                    .limit(20)
                    .collect(Collectors.toList());

            return processedUpdates;

        } catch (Exception e) {
            System.out.println("❌ Error fetching trip updates: " + e.getMessage());
            throw new RuntimeException("❌ Error fetching trip updates: " + e.getMessage());
        }
    }

    private TripUpdate mapToTripUpdate(TripUpdateResponse.TripUpdateEntity entity) {
        if (entity == null) {
            System.out.println("⚠️ Warning: Received a null TripUpdateEntity!");
            return null;
        }

        TripUpdateResponse.TripUpdateEntity.TripUpdate tripUpdate = entity.getTripUpdate();

        if (tripUpdate == null) {
            System.out.println("⚠️ Warning: TripUpdate is null for entity ID: " + entity.getId());
            return null;
        }

        if (tripUpdate.getTrip() == null) {
            System.out.println("⚠️ Warning: Trip data is missing for entity ID: " + entity.getId());
            return null;
        }

        if (tripUpdate.getStopUpdates() == null || tripUpdate.getStopUpdates().isEmpty()) {
            System.out.println("⚠️ Warning: No stop updates found for trip ID: " + tripUpdate.getTrip().getTripId());
            return null;
        }

        List<TripUpdate.StopTimeUpdate> stopUpdates = tripUpdate.getStopUpdates().stream()
                .map(su -> new TripUpdate.StopTimeUpdate(
                        su.getStopId(),
                        su.getStopSequence(),
                        su.getArrival() != null ? su.getArrival().getDelay() : 0,
                        su.getDeparture() != null ? su.getDeparture().getDelay() : 0
                ))
                .collect(Collectors.toList());

        // ✅ Get the last stop's departure delay (or arrival delay if departure is missing)
        TripUpdate.StopTimeUpdate lastStop = stopUpdates.isEmpty() ? null : stopUpdates.get(stopUpdates.size() - 1);
        int lastDelay = (lastStop != null && lastStop.getDepartureDelay() != 0) ? lastStop.getDepartureDelay() : (lastStop != null ? lastStop.getArrivalDelay() : 0);
        String lastStopId = (lastStop != null) ? lastStop.getStopId() : "Unknown";

        // ✅ Fetch route short name and transportation type
        String routeShortName = routeShortNames.get(tripUpdate.getTrip().getRouteId());
        String transportation = transportationMapping.get(tripUpdate.getTrip().getRouteId());

        // ✅ Fetch stop name
        String stopName = stopNames.get(lastStopId);

        // ✅ Skip entity if routeShortName, stopName, or transportation is missing
        if (routeShortName == null || stopName == null || transportation == null) {
            System.out.println("⚠️ Skipping entity: Missing data for Trip ID: " + tripUpdate.getTrip().getTripId());
            return null;
        }

        return new TripUpdate(
                tripUpdate.getTrip().getTripId(),
                tripUpdate.getTrip().getRouteId(),
                routeShortName,
                tripUpdate.getTrip().getStartTime(),
                tripUpdate.getTrip().getStartDate(),
                tripUpdate.getTrip().getDirectionId(),
                lastDelay,
                lastStopId,
                stopName,
                transportation,
                stopUpdates
        );
    }


}

