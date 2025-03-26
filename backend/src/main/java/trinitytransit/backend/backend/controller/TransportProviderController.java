package trinitytransit.backend.backend.controller;

import trinitytransit.backend.backend.entity.TransportProvider;
import trinitytransit.backend.backend.repository.TransportProviderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/providers")
public class TransportProviderController {

    @Autowired
    private TransportProviderRepository repo;

    @GetMapping
    public List<TransportProvider> getAll() {
        return repo.findAll();
    }

    @PostMapping
    public TransportProvider create(@RequestBody TransportProvider provider) {
        return repo.save(provider);
    }
}
