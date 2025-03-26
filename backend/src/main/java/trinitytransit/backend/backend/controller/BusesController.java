package trinitytransit.backend.backend.controller;

import trinitytransit.backend.backend.entity.Buses;
import trinitytransit.backend.backend.service.BusesService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class BusesController {

    @Autowired
    private BusesService busService;

    @GetMapping("/get_buses")
    public List<Buses> getAllBuses() {
        return busService.getBus();
    }

    @PostMapping("/get_buses")
    public Buses createBus(@RequestBody Buses bus) {
        return busService.saveBus(bus);
    }
}
