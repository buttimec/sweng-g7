package trinitytransit.backend.backend.controller;

import trinitytransit.backend.backend.entity.BusStop;
import trinitytransit.backend.backend.repository.BusStopRepository; 

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/busstops")
public class BusStopController {

    @Autowired
    private BusStopRepository busStopRepository;

    @GetMapping
    public List<BusStop> getAll() {
        return busStopRepository.findAll();
    }

    @PostMapping
    public BusStop create(@RequestBody BusStop stop) {
        return busStopRepository.save(stop);
    }
}
