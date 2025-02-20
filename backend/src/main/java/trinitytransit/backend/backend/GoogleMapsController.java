package trinitytransit.backend.backend;

import com.google.maps.model.DirectionsRoute;
import com.google.maps.model.GeocodingResult;
import com.google.maps.model.LatLng;
import com.google.maps.model.PlacesSearchResult;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class GoogleMapsController {

    private final GoogleMapsService googleMapsService;

    public GoogleMapsController(GoogleMapsService googleMapsService) {
        this.googleMapsService = googleMapsService;
    }

    @GetMapping("/geocode")
    public GeocodingResult[] geocodeAddress(@RequestParam String address) throws Exception {
        return googleMapsService.geocodeAddress(address);
    }

    @GetMapping("/getNearStops")
    public PlacesSearchResult[] genNearStops(@RequestParam LatLng loc) throws Exception {
        return googleMapsService.getNearbyBusStops(loc, 200);
    }

    @GetMapping("/getRoutes")
    public DirectionsRoute[] getBusRoutes(@RequestParam LatLng origin, @RequestParam LatLng destination) throws Exception {
        return googleMapsService.getDirections(origin, destination);
    }
}
