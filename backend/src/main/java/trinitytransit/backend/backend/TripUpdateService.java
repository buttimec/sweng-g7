package trinitytransit.backend.backend;

import org.springframework.stereotype.Service;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;
import com.fasterxml.jackson.databind.ObjectMapper; // Import Jackson for JSON conversion
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TripUpdateService {

    private static final String API_URL = "https://api.nationaltransport.ie/gtfsr/v2/TripUpdates?format=json";
    private static final String API_KEY = "9b70ea23a4a94ba68a7ebba3fadcd818";

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
                    .filter(update -> update != null) // ✅ Remove null entries
                    .limit(10)  // ✅ Show only 10 responses
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
            return new TripUpdate(
                    tripUpdate.getTrip().getTripId(),
                    tripUpdate.getTrip().getRouteId(),
                    tripUpdate.getTrip().getStartTime(),
                    tripUpdate.getTrip().getStartDate(),
                    tripUpdate.getTrip().getDirectionId(),
                    0, // No delay if no stops
                    "Unknown",
                    List.of()
            );
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
        TripUpdate.StopTimeUpdate lastStop = stopUpdates.get(stopUpdates.size() - 1);
        int lastDelay = lastStop.getDepartureDelay() != 0 ? lastStop.getDepartureDelay() : lastStop.getArrivalDelay();
        String lastStopId = lastStop.getStopId();

        return new TripUpdate(
                tripUpdate.getTrip().getTripId(),
                tripUpdate.getTrip().getRouteId(),
                tripUpdate.getTrip().getStartTime(),
                tripUpdate.getTrip().getStartDate(),
                tripUpdate.getTrip().getDirectionId(),
                lastDelay,  // ✅ Now storing only last stop delay
                lastStopId,
                stopUpdates
        );
    }


}

