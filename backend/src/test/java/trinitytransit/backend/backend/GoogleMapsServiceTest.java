package trinitytransit.backend.backend;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import static org.junit.jupiter.api.Assertions.*;
import com.google.maps.model.GeocodingResult;

@SpringBootTest
public class GoogleMapsServiceTest {

    @Autowired
    private GoogleMapsService googleMapsService;

    @Test
    public void testGeocodeAddress() throws Exception {
        String address = "1600 Amphitheatre Parkway, Mountain View, CA";
        GeocodingResult[] results = googleMapsService.geocodeAddress(address);

        assertNotNull(results);
        assertTrue(results.length > 0);
        assertEquals("1600 Amphitheatre Pkwy, Mountain View, CA 94043, USA", results[0].formattedAddress);
    }
}
