package trinitytransit.backend.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import trinitytransit.backend.backend.entity.TransportProvider;
import trinitytransit.backend.backend.repository.TransportProviderRepository;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/providers")
public class TransportProviderController {

    @Autowired
    private TransportProviderRepository providerRepository;

    // Get all
    @GetMapping
    public List<TransportProvider> getAll() {
        return providerRepository.findAll();
    }

    // Get by ID
    @GetMapping("/{id}")
    public ResponseEntity<TransportProvider> getById(@PathVariable Long id) {
        return providerRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Get by name
    @GetMapping("/by-name/{name}")
    public ResponseEntity<TransportProvider> getByName(@PathVariable String name) {
        return providerRepository.findByName(name)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
   

    // Create
    @PostMapping
    public TransportProvider create(@RequestBody TransportProvider provider) {
        return providerRepository.save(provider);
    }

    // {
    //     "name": "Dublin Coach",
    //     "vehicleType": "Bus"
    // }
      

    // Update
    @PutMapping("/{id}")
    public ResponseEntity<TransportProvider> update(@PathVariable Long id, @RequestBody TransportProvider updated) {
        return providerRepository.findById(id)
                .map(existing -> {
                    existing.setName(updated.getName());
                    existing.setVehicleType(updated.getVehicleType());
                    return ResponseEntity.ok(providerRepository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // Delete by ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (providerRepository.existsById(id)) {
            providerRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Delete by name  DELETE http://localhost:8080/api/providers/by-name/Dublin%20Coach
    @DeleteMapping("/by-name/{name}")
    public ResponseEntity<Void> deleteByName(@PathVariable String name) {
        Optional<TransportProvider> optionalProvider = providerRepository.findByName(name);

        if (optionalProvider.isPresent()) {
            providerRepository.delete(optionalProvider.get());
            return ResponseEntity.noContent().build(); // 204
        } else {
            return ResponseEntity.notFound().build(); // 404
        }
    }

    // Delete all
    @DeleteMapping("/all")
    public ResponseEntity<Void> deleteAll() {
        providerRepository.deleteAll();
        return ResponseEntity.noContent().build();
    }
}
