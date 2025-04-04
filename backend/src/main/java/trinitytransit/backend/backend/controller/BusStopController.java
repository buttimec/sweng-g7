package trinitytransit.backend.backend.controller;

import trinitytransit.backend.backend.entity.BusStop;
import trinitytransit.backend.backend.repository.BusStopRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/busstops")
public class BusStopController {

    @Autowired
    private BusStopRepository busStopRepository;

    // Get all bus stops   GET http://localhost:8080/api/busstops
    @GetMapping
    public List<BusStop> getAll() {
        return busStopRepository.findAll();
    }


    // Get a bus stop by ID
    @GetMapping("/{id}")
    public ResponseEntity<BusStop> getById(@PathVariable Long id) {
        Optional<BusStop> stop = busStopRepository.findById(id);
        return stop.map(ResponseEntity::ok)
                   .orElse(ResponseEntity.notFound().build());
    }

    // Create a new bus stop
    @PostMapping
    public BusStop create(@RequestBody BusStop stop) {
        return busStopRepository.save(stop);
    }

    // {
    //     "name": "Pearse Street Stop",
    //     "location": "53.3438,-6.2507"
    // }
      

    // Update an existing bus stop by ID
    @PutMapping("/{id}")
    public ResponseEntity<BusStop> update(@PathVariable Long id, @RequestBody BusStop stopDetails) {
        return busStopRepository.findById(id)
                .map(stop -> {
                    stop.setName(stopDetails.getName());
                    stop.setLocation(stopDetails.getLocation());
                    return ResponseEntity.ok(busStopRepository.save(stop));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/batch")
    public ResponseEntity<?> saveMultipleStops(@RequestBody List<BusStop> stops) {
        List<BusStop> saved = busStopRepository.saveAll(stops);
        return ResponseEntity.ok(saved);
    }


    // Delete a bus stop by ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (busStopRepository.existsById(id)) {
            busStopRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/by-name/{name}")
    public ResponseEntity<Void> deleteBusStopByName(@PathVariable String name) {
        List<BusStop> stops = busStopRepository.findAllByName(name);
        if (!stops.isEmpty()) {
            busStopRepository.deleteAll(stops);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    

    // Delete all bus stops
    @DeleteMapping("/all")
    public ResponseEntity<Void> deleteAll() {
        busStopRepository.deleteAll();
        return ResponseEntity.noContent().build();
    }
}
