package trinitytransit.backend.backend;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ConfigurableApplicationContext;

import com.google.maps.GeoApiContext;
import com.google.maps.model.LatLng;
import com.google.maps.model.PlacesSearchResult;

@SpringBootApplication
public class BackendApplication {

	public static void main(String[] args) throws Exception {
		ConfigurableApplicationContext context = SpringApplication.run(BackendApplication.class, args);
		
		GoogleMapsService googleMapsService = context.getBean(GoogleMapsService.class);

		LatLng trinityLocation = new LatLng(53.344480, -6.259396);
        int radius = 1000;
		PlacesSearchResult[] results = googleMapsService.getNearbyBusStops(trinityLocation, radius);

		for(PlacesSearchResult result : results)
		{
			System.out.println("Bus Stop: " + result.name + " at " + result.geometry.location);
		}
	}

}
