package trinitytransit.backend.backend.controller;

import trinitytransit.backend.backend.entity.RouteFave;
import trinitytransit.backend.backend.repository.RouteFaveRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/FaveRoutes")
public class RouteFaveController {

    @Autowired
    private RouteFaveRepository routeFaveRepository;

    // Get all favourite routes 
    @GetMapping
    public List<RouteFave> getAll() {
        return routeFaveRepository.findAll();
    }


    @GetMapping("/{id}")
    public ResponseEntity<RouteFave> getById(@PathVariable Long id) {
        Optional<RouteFave> stop = routeFaveRepository.findById(id);
        return stop.map(ResponseEntity::ok)
                   .orElse(ResponseEntity.notFound().build());
    }

    // Create a new favourite route
    @PostMapping
    public RouteFave create(@RequestBody RouteFave route) {
        return routeFaveRepository.save(route);
    }

      

    // Update an existing route by ID
    @PutMapping("/{id}")
    public ResponseEntity<RouteFave> update(@PathVariable Long id, @RequestBody RouteFave routeDetails) {
        return routeFaveRepository.findById(id)
                .map(route -> {
                    route.setName(routeDetails.getName());
                    route.setStartLocation(routeDetails.getStartLocation());
                    return ResponseEntity.ok(routeFaveRepository.save(route));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/batch")
    public ResponseEntity<?> saveMultipleStops(@RequestBody List<RouteFave> routes) {
        List<RouteFave> saved = routeFaveRepository.saveAll(routes);
        return ResponseEntity.ok(saved);
    }


    // Delete a favourite route by ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (routeFaveRepository.existsById(id)) {
            routeFaveRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/by-name/{name}")
    public ResponseEntity<Void> deleteFaveRouteByName(@PathVariable String name) {
        List<RouteFave> routes = routeFaveRepository.findAllByName(name);
        if (!routes.isEmpty()) {
            routeFaveRepository.deleteAll(routes);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    

    // Delete all favourite routes
    @DeleteMapping("/all")
    public ResponseEntity<Void> deleteAll() {
        routeFaveRepository.deleteAll();
        return ResponseEntity.noContent().build();
    }
}
