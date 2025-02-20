package trinitytransit.backend.backend;

import com.google.maps.GeoApiContext;
import com.google.maps.GeocodingApi;
import com.google.maps.model.DirectionsRoute;
import com.google.maps.model.GeocodingResult;
import com.google.maps.PlacesApi;
import com.google.maps.model.PlaceType;
import com.google.maps.model.PlacesSearchResult;
import com.google.maps.DirectionsApi;
import com.google.maps.model.LatLng;
import com.google.maps.model.TravelMode;
import org.springframework.stereotype.Service;

@Service
public class GoogleMapsService {
    private final GeoApiContext context;

    public GoogleMapsService(GeoApiContext context) {
        this.context = context;
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
}
