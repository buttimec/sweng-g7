package trinitytransit.backend.backend;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;
import java.util.List;

@RestController
public class TripUpdateController {

    @Autowired
    private TripUpdateService tripUpdateService;

    @GetMapping("/api/tripupdates")
    public ResponseEntity<List<TripUpdate>> getTripUpdates() {
        try {
            List<TripUpdate> tripUpdates = tripUpdateService.getTripUpdates();
            return ResponseEntity.ok(tripUpdates);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }
}
