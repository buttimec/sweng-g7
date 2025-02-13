package trinitytransit.backend.backend;

import com.google.maps.GeoApiContext;
import com.google.maps.GeocodingApi;
import com.google.maps.model.GeocodingResult;
import com.google.maps.model.LatLng;
import com.google.maps.PlacesApi;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class GoogleMapsService {

    private final GeoApiContext context;
    private static final String BASE_URL = "https://maps.googleapis.com/maps/api/place/nearbysearch/json";

    @Value("${google.maps.api.key}")
    private String apiKey;

    public GoogleMapsService(GeoApiContext context) {
        this.context = context;
    }

    public GeocodingResult[] geocodeAddress(String address) throws Exception {
        return GeocodingApi.geocode(context, address).await();
    }

    public String getNearbyBusStops(double lat, double lng, int radius){
        String url = String.format("%s?location=%f,%f&radius=%d&type=bus_station&key=%s",
                BASE_URL, lat, lng, radius, apiKey);

        RestTemplate restTemplate = new RestTemplate();
        ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);

        LatLng test = new LatLng(lat, lng);
        PlacesApi.nearbySearchQuery(context, test);

        return response.getBody();
    }

    // Add more methods for different Google Maps API functionalities
}
