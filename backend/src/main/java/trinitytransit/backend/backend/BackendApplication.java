package trinitytransit.backend.backend;

//import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ConfigurableApplicationContext;

import com.google.maps.GeoApiContext;
import com.google.maps.model.DirectionsLeg;
import com.google.maps.model.DirectionsRoute;
import com.google.maps.model.DirectionsStep;
import com.google.maps.model.LatLng;
import com.google.maps.model.PlacesSearchResult;
import com.google.maps.model.TravelMode;

@SpringBootApplication
public class BackendApplication {

	public static void main(String[] args) throws Exception {
		ConfigurableApplicationContext context = SpringApplication.run(BackendApplication.class, args);
		
		GoogleMapsService googleMapsService = context.getBean(GoogleMapsService.class);

		LatLng trinityLocation = new LatLng(53.344480, -6.259396);
		LatLng hereCorkLocation = new LatLng(53.337863, -6.283883);
        
		DirectionsRoute[] results = googleMapsService.getDirections(trinityLocation, hereCorkLocation);

		for(DirectionsRoute result : results)
		{
			System.out.println("Route: ");
			for(DirectionsLeg leg : result.legs)
			{
				System.out.println("Leg: ");
				for(DirectionsStep step : leg.steps)
				{
					System.out.println(step.travelMode);
					if(step.travelMode == TravelMode.TRANSIT)
					{
						System.out.println(step.transitDetails.line.toString());
					}
					System.out.println(step.htmlInstructions);
				}
			}
		}

		/*int radius = 1000;
		PlacesSearchResult[] results = googleMapsService.getNearbyBusStops(trinityLocation, radius);

		for(PlacesSearchResult result : results)
		{
			System.out.println("Bus Stop: " + result.name + " at " + result.geometry.location);
		}*/
	}

}
