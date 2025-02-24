package trinitytransit.backend.backend;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import java.util.List;

@RestController
@RequestMapping("/api/trip-updates")
@CrossOrigin(origins = "http://localhost:3000")
public class TripUpdateController {

    @Autowired
    private TripUpdateService tripUpdateService;

    @GetMapping
    public ResponseEntity<List<TripUpdate>> getTripUpdates() {
        try {
            List<TripUpdate> tripUpdates = tripUpdateService.getTripUpdates();
            return ResponseEntity.ok(tripUpdates);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }
}

