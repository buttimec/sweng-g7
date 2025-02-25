package trinitytransit.backend.backend;
import com.google.maps.model.DirectionsRoute;
import com.google.maps.model.GeocodingResult;
import com.google.maps.model.LatLng;
import com.google.maps.model.PlaceDetails;
import com.google.maps.model.PlacesSearchResult;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;



@RestController
public class GoogleMapsController {

    private final GoogleMapsService googleMapsService;

    public GoogleMapsController(GoogleMapsService googleMapsService) {
        this.googleMapsService = googleMapsService;
    }

    @GetMapping("/")
    public String helloWorld() {
        return "Hello, World!";
    }

    // http://localhost:8080/nearby-bus-stops?lat=53.344480&lng=-6.259396&radius=1000
    @GetMapping("/geocode")
    public ResponseEntity<?> geocodeAddress(@RequestParam String address) {
        try {
            GeocodingResult[] results = googleMapsService.geocodeAddress(address);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error geocoding address: " + e.getMessage());
        }
    }

    // http://localhost:8080/getNearStops?lat=53.344480&lng=-6.259396&radius=1000
    @GetMapping("/getNearStops")
    public PlacesSearchResult[] getNearbyBusStops(
            @RequestParam double lat,
            @RequestParam double lng,
            @RequestParam int radius) throws Exception {
        LatLng location = new LatLng(lat, lng); // Construct LatLng from lat and lng
        return googleMapsService.getNearbyBusStops(location, radius);
    }

    @GetMapping("/placeDetails")
    public PlaceDetails getPlaceDetails(@RequestParam String placeId) throws Exception {
        return googleMapsService.getDetails(placeId);
    }

    //http://localhost:8080/directions?originLat=53.344480&originLng=-6.259396&destLat=53.337863&destLng=-6.283883

    @GetMapping("/directions")
        public ResponseEntity<?> getDirections(
        @RequestParam double originLat, 
        @RequestParam double originLng,
        @RequestParam double destLat, 
        @RequestParam double destLng) {
        try {
            LatLng origin = new LatLng(originLat, originLng);
            LatLng destination = new LatLng(destLat, destLng);
            DirectionsRoute[] results = googleMapsService.getDirections(origin, destination);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
        return ResponseEntity.status(500).body("Error fetching directions: " + e.getMessage());
        }
}
}
