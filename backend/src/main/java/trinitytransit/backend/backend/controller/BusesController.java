package trinitytransit.backend.backend.controller;

import trinitytransit.backend.backend.entity.Buses;
import trinitytransit.backend.backend.repository.BusesRepository;
import trinitytransit.backend.backend.service.BusesService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/buses")
public class BusesController {

    @Autowired
    private BusesService busService;

    @Autowired
    private BusesRepository busesRepository;

    
    @GetMapping
    public List<Buses> getAllBuses() {
        return busService.getBus();
    }

    @PostMapping
    public Buses createBus(@RequestBody Buses bus) {
        return busService.saveBus(bus);
    }
    
    // Batch save buses (optional)
    @PostMapping("/batch")
    public List<Buses> createBuses(@RequestBody List<Buses> buses) {
        return busService.saveBuses(buses); // Ensure this method exists in BusesService
    }

    // Delete by name DELETE http://localhost:8080/api/buses/by-name/Clontarf%20Express

    @DeleteMapping("/by-name/{name}")
    public ResponseEntity<Void> deleteBusByName(@PathVariable String name) {
        Optional<Buses> optionalBus = busesRepository.findByName(name);
        if (optionalBus.isPresent()) {
            busesRepository.delete(optionalBus.get());
            return ResponseEntity.noContent().build(); // 204 No Content
        } else {
            return ResponseEntity.notFound().build(); // 404 Not Found
        }
    }

    @DeleteMapping("/{id}") //delete by id
    public ResponseEntity<Void> deleteBus(@PathVariable Long id) {
        if (busesRepository.existsById(id)) {
            busesRepository.deleteById(id);
            return ResponseEntity.noContent().build(); // 204 No Content
        } else {
            return ResponseEntity.notFound().build(); // 404 Not Found
        }
    }

    @DeleteMapping("/all") //wipre database
    public ResponseEntity<Void> deleteAllBuses() {
        busesRepository.deleteAll();
        return ResponseEntity.noContent().build(); // 204 No Content
    }
}
